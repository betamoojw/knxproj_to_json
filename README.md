# knxproj_to_json

Refer to this XKNX -> xknxproject https://github.com/XKNX/xknxproject

Recommended Python converter

Install:

pip install xknxproject

Usage

For a normal project:

python knxproj_to_json.py myproject.knxproj

This creates:

myproject.json

Or specify the output:

python knxproj_to_json.py myproject.knxproj -o knxConfig.json

For a password-protected project:

python knxproj_to_json.py myproject.knxproj \
    --password "my-password"

For a specific language:

python knxproj_to_json.py myproject.knxproj \
    --language en-US
What the generated JSON contains

The parser already exposes substantially more than just group addresses. According to the project documentation, it can provide:

Areas
Lines
Devices
Device individual addresses
Device channels
Communication object instances
Group addresses
Group-address DPTs
Application-program communication objects
Communication-object flags
Communication-object DPTs
Device locations / rooms
Functions assigned to rooms
Application/module information in recent versions

So the resulting JSON will look conceptually like:

{
  "devices": {
    "1.1.1": {
      "name": "Living Room Switch",
      "manufacturer_name": "MDT",
      "...": "..."
    }
  },
  "group_addresses": {
    "1/0/1": {
      "name": "Living Room Light",
      "dpt": "1.001"
    },
    "1/0/2": {
      "name": "Living Room Temperature",
      "dpt": "9.001"
    }
  }
}

The exact fields depend on the ETS project and the xknxproject version.

A better version for your KNX JSON configuration

Based on the KNX JSON structure you've been working with, I would actually recommend not simply dumping the entire KNXProject dictionary. Instead, use xknxproject as the ETS parser and then transform its output into your application's own stable schema.

For example:

def create_knx_config(project: dict) -> dict:
    config = {
        "version": "1.0",
        "devices": [],
        "communication_objects": [],
        "group_addresses": [],
    }

    # Devices
    for individual_address, device in project.get("devices", {}).items():
        config["devices"].append({
            "individual_address": individual_address,
            "name": device.get("name"),
            "manufacturer": device.get("manufacturer_name"),
        })

    # Group addresses
    for group_address, group_data in project.get(
        "group_addresses", {}
    ).items():
        config["group_addresses"].append({
            "group_address": group_address,
            "name": group_data.get("name"),
            "datapoint_type": group_data.get("dpt"),
        })

    return config

Then:

project = XKNXProj("myproject.knxproj").parse()

config = create_knx_config(project)

with open("knxConfig.json", "w", encoding="utf-8") as f:
    json.dump(
        config,
        f,
        indent=2,
        ensure_ascii=False,
    )

This approach is preferable if knxConfig.json is going to be consumed by your ESP/KNX application, because your application won't become coupled to the internal data model of xknxproject.

The current project release is 3.10.0, which also added project-context functionality; the project supports ETS 4, 5 and 6
