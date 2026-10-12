#!/usr/bin/env python3

import argparse
import json
from importlib.metadata import PackageNotFoundError, version
import mimetypes
import re
import shutil
import sys
import tempfile
import time
import uuid
from email.parser import BytesParser
from email.policy import default
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

from knxproj_to_json import (
    _load_json,
    _validate_knx_config,
    _write_json,
    create_knx_config,
    convert_knxproj_to_json,
)


ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "web"
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
CONVERSION_TTL_SECONDS = 60 * 60
CONVERSIONS: dict[str, dict[str, Any]] = {}


class WebApplicationError(Exception):
    """An expected error that can be safely shown to the browser."""


def _safe_filename(filename: str) -> str:
    name = Path(filename).name
    if not name or Path(name).suffix.lower() != ".knxproj":
        raise WebApplicationError("Choose an ETS .knxproj file.")
    return re.sub(r"[^A-Za-z0-9._-]", "_", name)


def _validate_application_config(config: Any) -> dict[str, Any]:
    if not isinstance(config, dict):
        raise WebApplicationError("Configuration must be a JSON object.")

    required = {"media_type", "media_parameters", "physical_address", "comObjects"}
    unexpected = sorted(set(config) - required)
    missing = sorted(required - set(config))
    if missing:
        raise WebApplicationError(
            "Missing required fields: " + ", ".join(missing)
        )
    if unexpected:
        raise WebApplicationError(
            "Unexpected top-level fields: " + ", ".join(unexpected)
        )
    if config["media_type"] != "knx_ip":
        raise WebApplicationError("media_type must be 'knx_ip'.")
    if not isinstance(config["media_parameters"], dict):
        raise WebApplicationError("media_parameters must be an object.")
    if not isinstance(config["comObjects"], list):
        raise WebApplicationError("comObjects must be an array.")

    media_parameters = config["media_parameters"]
    required_media_fields = {
        "multicast_address",
        "udp_port",
        "transport_mode",
        "interface_identifier",
        "nat",
    }
    missing_media_fields = sorted(required_media_fields - set(media_parameters))
    unexpected_media_fields = sorted(set(media_parameters) - required_media_fields)
    if missing_media_fields:
        raise WebApplicationError(
            "Missing media_parameters fields: " + ", ".join(missing_media_fields)
        )
    if unexpected_media_fields:
        raise WebApplicationError(
            "Unexpected media_parameters fields: "
            + ", ".join(unexpected_media_fields)
        )
    if not isinstance(media_parameters["multicast_address"], str):
        raise WebApplicationError("multicast_address must be a string.")
    if not isinstance(media_parameters["udp_port"], int) or not 1 <= media_parameters["udp_port"] <= 65535:
        raise WebApplicationError("udp_port must be an integer between 1 and 65535.")
    if media_parameters["transport_mode"] not in {"routing", "tunneling"}:
        raise WebApplicationError("transport_mode must be 'routing' or 'tunneling'.")
    if not isinstance(media_parameters["interface_identifier"], str):
        raise WebApplicationError("interface_identifier must be a string.")
    if not isinstance(media_parameters["nat"], bool):
        raise WebApplicationError("nat must be a boolean.")

    try:
        _validate_knx_config(config)
    except (KeyError, TypeError, ValueError) as error:
        raise WebApplicationError(str(error)) from error

    dpt_pattern = re.compile(r"^DPT-[0-9]{1,2}\.[0-9]{3}$")
    required_object_fields = {
        "id",
        "name",
        "description",
        "group_address",
        "datapoint_type",
        "readable",
        "writable",
        "unit",
    }
    seen_ids: set[str] = set()
    for index, item in enumerate(config["comObjects"]):
        if not isinstance(item, dict):
            raise WebApplicationError(f"comObjects[{index}] must be an object.")
        missing_fields = sorted(required_object_fields - set(item))
        unexpected_fields = sorted(set(item) - required_object_fields)
        if missing_fields:
            raise WebApplicationError(
                f"comObjects[{index}] is missing: {', '.join(missing_fields)}"
            )
        if unexpected_fields:
            raise WebApplicationError(
                f"comObjects[{index}] has unexpected fields: {', '.join(unexpected_fields)}"
            )
        object_id = item["id"]
        if not isinstance(object_id, str) or not object_id.strip():
            raise WebApplicationError(f"comObjects[{index}].id must be a string.")
        if object_id in seen_ids:
            raise WebApplicationError(f"Duplicate communication-object ID: {object_id}")
        seen_ids.add(object_id)
        if not isinstance(item["datapoint_type"], str) or not dpt_pattern.fullmatch(
            item["datapoint_type"]
        ):
            raise WebApplicationError(
                f"Invalid datapoint_type for communication object {object_id}."
            )
        if not isinstance(item["unit"], (str, type(None))):
            raise WebApplicationError(f"Invalid unit for communication object {object_id}.")

    return config


def summarize_config(config: dict[str, Any]) -> dict[str, Any]:
    objects = config.get("comObjects", [])
    dpt_counts: dict[str, int] = {}
    for item in objects:
        dpt = item.get("datapoint_type")
        dpt_counts[dpt] = dpt_counts.get(dpt, 0) + 1

    return {
        "media_type": config.get("media_type"),
        "physical_address": config.get("physical_address"),
        "communication_objects": len(objects),
        "unique_ids": len({item.get("id") for item in objects}),
        "unique_group_addresses": len(
            {item.get("group_address") for item in objects}
        ),
        "readable": sum(bool(item.get("readable")) for item in objects),
        "writable": sum(bool(item.get("writable")) for item in objects),
        "with_units": sum(item.get("unit") is not None for item in objects),
        "dpt_counts": dict(sorted(dpt_counts.items())),
    }


def _cleanup_conversions() -> None:
    cutoff = time.time() - CONVERSION_TTL_SECONDS
    for conversion_id, record in list(CONVERSIONS.items()):
        if record["created_at"] < cutoff:
            shutil.rmtree(record["workdir"], ignore_errors=True)
            del CONVERSIONS[conversion_id]


def _parser_version() -> str | None:
    try:
        return version("xknxproject")
    except PackageNotFoundError:
        return None


def environment_payload() -> dict[str, Any]:
    version = _parser_version()
    return {
        "python_version": sys.version.split()[0],
        "xknxproject_version": version,
        "ready": version is not None,
        "requirements": {
            "python": ">=3.10",
            "xknxproject": ">=3.10.0",
        },
        "start_command": "python web_app.py",
    }


class KNXRequestHandler(BaseHTTPRequestHandler):
    server_version = "KNXConfigWeb/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        # Avoid logging request bodies, filenames, or credentials.
        sys.stderr.write(f"{self.address_string()} - {format % args}\n")

    def _send_json(self, payload: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_error(self, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST) -> None:
        self._send_json({"error": message}, status)

    def _read_body(self) -> bytes:
        content_length = self.headers.get("Content-Length")
        try:
            length = int(content_length or "0")
        except ValueError as error:
            raise WebApplicationError("Invalid request size.") from error
        if length > MAX_UPLOAD_BYTES:
            raise WebApplicationError("The upload exceeds the 50 MB limit.")
        return self.rfile.read(length)

    def _read_json_body(self) -> Any:
        body = self._read_body()
        try:
            return json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise WebApplicationError("Request body must be valid JSON.") from error

    def _read_multipart(self) -> dict[str, Any]:
        body = self._read_body()
        content_type = self.headers.get("Content-Type", "")
        if not content_type.startswith("multipart/form-data"):
            raise WebApplicationError("Expected a multipart form upload.")
        envelope = (
            f"Content-Type: {content_type}\r\n"
            "MIME-Version: 1.0\r\n\r\n"
        ).encode("ascii") + body
        message = BytesParser(policy=default).parsebytes(envelope)
        fields: dict[str, Any] = {}
        for part in message.iter_parts():
            disposition = part.get("Content-Disposition", "")
            field_name = part.get_param("name", header="content-disposition")
            if not field_name:
                continue
            filename = part.get_filename()
            content = part.get_payload(decode=True) or b""
            if filename is not None:
                fields[field_name] = {
                    "filename": filename,
                    "content": content,
                }
            else:
                fields[field_name] = content.decode("utf-8", errors="replace")
        return fields

    def do_GET(self) -> None:
        _cleanup_conversions()
        parsed = urlparse(self.path)
        route = parsed.path.rstrip("/") or "/"
        try:
            if route == "/api/health":
                self._send_json({"ok": True, **environment_payload()})
                return
            if route == "/api/environment":
                self._send_json(environment_payload())
                return
            if route.startswith("/api/result/"):
                conversion_id = unquote(route.rsplit("/", 1)[-1])
                record = CONVERSIONS.get(conversion_id)
                if record is None:
                    self._send_error("Conversion not found.", HTTPStatus.NOT_FOUND)
                    return
                self._send_json(
                    {
                        "conversion_id": conversion_id,
                        "summary": record["summary"],
                        "config": record["config"],
                        "raw": record["raw"],
                        "raw_available": True,
                    }
                )
                return
            if route.startswith("/api/download/"):
                self._download(route)
                return
            self._serve_static(route)
        except WebApplicationError as error:
            self._send_error(str(error))
        except Exception:
            self._send_error("The server could not complete that request.", HTTPStatus.INTERNAL_SERVER_ERROR)

    def _download(self, route: str) -> None:
        parts = route.strip("/").split("/")
        if len(parts) != 4 or parts[0:2] != ["api", "download"]:
            self._send_error("Invalid download URL.", HTTPStatus.NOT_FOUND)
            return
        record = CONVERSIONS.get(parts[2])
        if record is None:
            self._send_error("Conversion not found.", HTTPStatus.NOT_FOUND)
            return
        if parts[3] == "config":
            path = record["config_path"]
            filename = "knxConfig.json"
        elif parts[3] == "temp":
            path = record["temp_path"]
            filename = "knxConfigTemp.json"
        else:
            self._send_error("Unknown download type.", HTTPStatus.NOT_FOUND)
            return
        body = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_static(self, route: str) -> None:
        relative = "index.html" if route == "/" else route.lstrip("/")
        candidate = (STATIC_DIR / relative).resolve()
        if STATIC_DIR.resolve() not in candidate.parents and candidate != STATIC_DIR.resolve():
            self._send_error("Not found.", HTTPStatus.NOT_FOUND)
            return
        if not candidate.is_file():
            self._send_error("Not found.", HTTPStatus.NOT_FOUND)
            return
        body = candidate.read_bytes()
        content_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        _cleanup_conversions()
        parsed = urlparse(self.path)
        try:
            if parsed.path == "/api/convert":
                self._convert()
                return
            if parsed.path == "/api/validate":
                payload = self._read_json_body()
                config = _validate_application_config(payload)
                self._send_json({"valid": True, "summary": summarize_config(config)})
                return
            self._send_error("Not found.", HTTPStatus.NOT_FOUND)
        except WebApplicationError as error:
            self._send_error(str(error))
        except Exception as error:
            self._send_error(str(error), HTTPStatus.INTERNAL_SERVER_ERROR)

    def _convert(self) -> None:
        fields = self._read_multipart()
        project = fields.get("project")
        if not isinstance(project, dict):
            raise WebApplicationError("Select an ETS .knxproj project file.")
        filename = _safe_filename(project["filename"])
        if len(project["content"]) > MAX_UPLOAD_BYTES:
            raise WebApplicationError("The upload exceeds the 50 MB limit.")

        password = fields.get("password") or None
        language = fields.get("language") or None
        conversion_id = uuid.uuid4().hex
        workdir = Path(tempfile.mkdtemp(prefix=f"knx-conversion-{conversion_id}-"))
        input_path = workdir / filename
        temp_path = workdir / "knxConfigTemp.json"
        config_path = workdir / "knxConfig.json"
        try:
            input_path.write_bytes(project["content"])
            convert_knxproj_to_json(
                str(input_path),
                str(temp_path),
                password=password,
                language=language,
            )
            raw_project = _load_json(temp_path)
            config = create_knx_config(raw_project)
            _write_json(config, config_path, allow_fallback=False)
            _validate_application_config(config)
        except Exception:
            shutil.rmtree(workdir, ignore_errors=True)
            raise

        record = {
            "created_at": time.time(),
            "workdir": workdir,
            "temp_path": temp_path,
            "config_path": config_path,
            "config": config,
            "raw": raw_project,
            "summary": summarize_config(config),
        }
        CONVERSIONS[conversion_id] = record
        self._send_json(
            {
                "conversion_id": conversion_id,
                "summary": record["summary"],
                "config": config,
                "raw_available": True,
            },
            HTTPStatus.CREATED,
        )


def create_server(host: str, port: int) -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), KNXRequestHandler)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the KNX configuration web interface.")
    parser.add_argument("--host", default="127.0.0.1", help="Interface to bind, default: 127.0.0.1")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind, default: 8000")
    args = parser.parse_args()

    server = create_server(args.host, args.port)
    print(f"KNX configuration web interface: http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping web interface.")
    finally:
        server.server_close()
        for record in CONVERSIONS.values():
            shutil.rmtree(record["workdir"], ignore_errors=True)


if __name__ == "__main__":
    main()
