#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
from typing import Any

from xknxproject import XKNXProj
from xknxproject.exceptions import InvalidPasswordException


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

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(
            json_data,
            file,
            indent=2,
            ensure_ascii=False,
            default=str,
        )

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
        "-o",
        "--output",
        help="Output JSON file. Defaults to <input>.json",
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
        output_path = convert_knxproj_to_json(
            input_file=args.input,
            output_file=args.output,
            password=args.password,
            language=args.language,
        )

        print(f"Successfully converted:")
        print(f"  Input : {args.input}")
        print(f"  Output: {output_path}")

    except Exception as exc:
        parser.error(str(exc))


if __name__ == "__main__":
    main()
