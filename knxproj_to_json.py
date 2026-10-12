#!/usr/bin/env python3

import argparse
import json
import re
from pathlib import Path
from typing import Any

from xknxproject import XKNXProj
from xknxproject.exceptions import InvalidPasswordException


DEFAULT_TEMP_FILE = "knxConfigTemp.json"
DEFAULT_OUTPUT_FILE = "knxConfig.json"
DEFAULT_MEDIA_PARAMETERS = {
    "multicast_address": "224.0.23.12",
    "udp_port": 3671,
    "transport_mode": "routing",
    "interface_identifier": "KNX-IP-Interface",
    "nat": False,
}
DEFAULT_PHYSICAL_ADDRESS = "15.15.199"


def _write_json(data: Any, output_path: Path, *, allow_fallback: bool) -> None:
    with output_path.open("w", encoding="utf-8") as file:
        dump_options = {
            "indent": 2,
            "ensure_ascii": False,
        }
        if allow_fallback:
            dump_options["default"] = str
        json.dump(data, file, **dump_options)


def _load_json(input_path: Path) -> dict[str, Any]:
    with input_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, dict):
        raise ValueError(f"Temporary JSON must contain an object: {input_path}")

    return data


def _format_dpt(dpt: Any) -> str:
    if not isinstance(dpt, dict):
        raise ValueError("DPT data must be an object")

    main = dpt.get("main")
    sub = dpt.get("sub")
    if not isinstance(main, int) or not 0 <= main <= 99:
        raise ValueError(f"Invalid DPT main value: {main!r}")
    if sub is None:
        sub = 0
    if not isinstance(sub, int) or not 0 <= sub <= 999:
        raise ValueError(f"Invalid DPT sub value: {sub!r}")

    return f"DPT-{main}.{sub:03d}"


def _select_dpt(
    communication_object: dict[str, Any],
    group_address: dict[str, Any],
) -> str:
    object_dpts = communication_object.get("dpts")
    if isinstance(object_dpts, list):
        for dpt in object_dpts:
            if isinstance(dpt, dict) and dpt.get("sub") is not None:
                return _format_dpt(dpt)

    group_dpt = group_address.get("dpt")
    if group_dpt is not None:
        return _format_dpt(group_dpt)

    if isinstance(object_dpts, list) and object_dpts:
        return _format_dpt(object_dpts[0])

    raise ValueError("Communication object has no datapoint type")


def _unit_for_dpt(datapoint_type: str) -> str | None:
    return {
        "DPT-5.001": "%",
        "DPT-5.003": "deg",
        "DPT-5.004": "%",
        "DPT-7.005": "s",
        "DPT-7.006": "min",
        "DPT-7.600": "K",
        "DPT-9.001": "deg C",
        "DPT-9.002": "K",
        "DPT-9.004": "lx",
        "DPT-9.005": "m/s",
        "DPT-9.006": "hPa",
        "DPT-9.008": "ppm",
        "DPT-13.010": "W",
        "DPT-13.013": "kWh",
        "DPT-14.056": "lx",
        "DPT-27.001": "%",
    }.get(datapoint_type)


def _slugify(identifier: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", identifier.lower()).strip("_")
    return f"com_{slug or 'object'}"


def _validate_physical_address(address: str) -> None:
    pattern = r"^(?:[0-9]|1[0-5])\.(?:[0-9]|1[0-5])\.(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
    if not re.fullmatch(pattern, address):
        raise ValueError(f"Invalid KNX physical address: {address!r}")


def _validate_group_address(address: str) -> None:
    pattern = r"^(?:[0-9]|[12][0-9]|3[01])/[0-7]/(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
    if not re.fullmatch(pattern, address):
        raise ValueError(f"Invalid KNX group address: {address!r}")


def _validate_knx_config(config: dict[str, Any]) -> None:
    physical_address = config["physical_address"]
    if not isinstance(physical_address, str):
        raise ValueError("physical_address must be a string")
    _validate_physical_address(physical_address)

    object_ids: set[str] = set()
    for communication_object in config["comObjects"]:
        object_id = communication_object["id"]
        if object_id in object_ids:
            raise ValueError(f"Duplicate communication-object ID: {object_id}")
        object_ids.add(object_id)

        _validate_group_address(communication_object["group_address"])
        if not isinstance(communication_object["readable"], bool):
            raise ValueError(f"Invalid readable flag for {object_id}")
        if not isinstance(communication_object["writable"], bool):
            raise ValueError(f"Invalid writable flag for {object_id}")
        if not isinstance(communication_object["unit"], (str, type(None))):
            raise ValueError(f"Invalid unit for {object_id}")


def create_knx_config(project: dict[str, Any]) -> dict[str, Any]:
    communication_objects = project.get("communication_objects", {})
    group_addresses = project.get("group_addresses", {})
    if not isinstance(communication_objects, dict):
        raise ValueError("Temporary project has invalid communication_objects")
    if not isinstance(group_addresses, dict):
        raise ValueError("Temporary project has invalid group_addresses")

    result: dict[str, Any] = {
        "media_type": "knx_ip",
        "media_parameters": dict(DEFAULT_MEDIA_PARAMETERS),
        "physical_address": DEFAULT_PHYSICAL_ADDRESS,
        "comObjects": [],
    }
    used_ids: set[str] = set()

    for raw_id, raw_object in communication_objects.items():
        if not isinstance(raw_object, dict):
            raise ValueError(f"Invalid communication object: {raw_id!r}")

        links = raw_object.get("group_address_links")
        if not isinstance(links, list) or not links:
            raise ValueError(
                f"Communication object has no group-address links: {raw_id}"
            )

        for link in links:
            if not isinstance(link, str):
                raise ValueError(f"Invalid group-address link for {raw_id}")
            group_address = group_addresses.get(link, {})
            if not isinstance(group_address, dict):
                raise ValueError(f"Invalid group address data: {link}")

            datapoint_type = _select_dpt(raw_object, group_address)
            object_id = _slugify(raw_id)
            if len(links) > 1:
                object_id = f"{object_id}_ga_{link.replace('/', '_')}"
            candidate_id = object_id
            suffix = 2
            while candidate_id in used_ids:
                candidate_id = f"{object_id}_{suffix}"
                suffix += 1
            used_ids.add(candidate_id)

            flags = raw_object.get("flags")
            if not isinstance(flags, dict):
                raise ValueError(f"Communication object has invalid flags: {raw_id}")
            readable = flags.get("read")
            writable = flags.get("write")
            if not isinstance(readable, bool) or not isinstance(writable, bool):
                raise ValueError(f"Communication object has invalid flags: {raw_id}")

            name = raw_object.get("name") or group_address.get("name") or raw_id
            description = (
                raw_object.get("description")
                or raw_object.get("function_text")
                or group_address.get("description")
                or group_address.get("comment")
                or ""
            )
            result["comObjects"].append(
                {
                    "id": candidate_id,
                    "name": name,
                    "description": description,
                    "group_address": link,
                    "datapoint_type": datapoint_type,
                    "readable": readable,
                    "writable": writable,
                    "unit": _unit_for_dpt(datapoint_type),
                }
            )

    _validate_knx_config(result)
    return result


def convert_knxproj_to_json(
    input_file: str,
    output_file: str | None = None,
    password: str | None = None,
    language: str | None = None,
) -> Path:
    """
    Parse an ETS .knxproj file and export the parsed KNX project as JSON.
    """

    input_path = Path(input_file)

    if not input_path.exists():
        raise FileNotFoundError(f"KNX project not found: {input_path}")

    if output_file is None:
        output_path = input_path.with_suffix(".json")
    else:
        output_path = Path(output_file)

    # Create the XKNX project parser.
    project_parser = XKNXProj(
        path=str(input_path),
        password=password,
        language=language,
    )

    try:
        project = project_parser.parse()

    except InvalidPasswordException:
        if password is None:
            raise RuntimeError(
                "The KNX project is password protected. "
                "Specify the password with --password."
            ) from None

        raise

    # KNXProject is dictionary-like, but make sure everything is
    # converted into normal JSON-compatible Python objects.
    json_data: Any = dict(project)
    _write_json(json_data, output_path, allow_fallback=True)

    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert an ETS .knxproj file to JSON."
    )

    parser.add_argument(
        "input",
        help="Path to the ETS .knxproj file",
    )

    parser.add_argument(
        "-t",
        "--temp",
        help=f"Temporary parser JSON file. Defaults to {DEFAULT_TEMP_FILE}",
    )

    parser.add_argument(
        "-o",
        "--output",
        help=f"Application JSON file. Defaults to {DEFAULT_OUTPUT_FILE}",
    )

    parser.add_argument(
        "-p",
        "--password",
        help="Password for a password-protected KNX project",
    )

    parser.add_argument(
        "-l",
        "--language",
        default=None,
        help="Preferred project language, e.g. en-US or de-DE",
    )

    args = parser.parse_args()

    try:
        temp_path = Path(args.temp) if args.temp else Path(DEFAULT_TEMP_FILE)
        output_path = Path(args.output) if args.output else Path(DEFAULT_OUTPUT_FILE)

        temp_path = convert_knxproj_to_json(
            input_file=args.input,
            output_file=str(temp_path),
            password=args.password,
            language=args.language,
        )
        project = _load_json(temp_path)
        config = create_knx_config(project)
        _write_json(config, output_path, allow_fallback=False)

        print(f"Successfully converted:")
        print(f"  Input : {args.input}")
        print(f"  Temp  : {temp_path}")
        print(f"  Output: {output_path}")

    except Exception as exc:
        parser.error(str(exc))


if __name__ == "__main__":
    main()
