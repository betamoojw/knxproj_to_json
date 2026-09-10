# KNX ETS Project → JSON

<p align="center">
  <strong>Convert ETS <code>.knxproj</code> projects into clean, application-friendly JSON.</strong>
</p>

<p align="center">
  Parse KNX project data with <a href="https://github.com/XKNX/xknxproject">xknxproject</a>
  and transform it into a stable JSON configuration for your application.
</p>

<p align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square\&logo=python\&logoColor=white)
![KNX](https://img.shields.io/badge/KNX-ETS-00A98F?style=flat-square)
![xknxproject](https://img.shields.io/badge/xknxproject-3.10.0-6F42C1?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)

</p>

---

## ✨ Overview

**KNX Project → JSON** is a small Python utility for converting an ETS
`.knxproj` project into JSON.

It uses the excellent
**[XKNX `xknxproject`](https://github.com/XKNX/xknxproject)** parser to read
the ETS project and exposes useful KNX information such as:

* 🏠 Devices
* 🔢 Individual addresses
* 🔌 Communication objects
* 🏷️ Group addresses
* 📐 Datapoint types (DPT)
* 🚩 Communication-object flags
* 🗺️ Areas and lines
* 🚪 Rooms and device locations
* ⚙️ Application-program information
* 🔗 Functions and their assignments

The goal is **not simply to dump the internal `xknxproject` data structure**.

Instead, the project can transform the parsed ETS data into a **stable,
application-specific JSON schema** suitable for embedded systems,
automation software, configuration tools, or other KNX applications.

---

## 🚀 Quick Start

### 1. Install the dependency

```bash
pip install xknxproject
```

### 2. Convert a project

```bash
python knxproj_to_json.py myproject.knxproj
```

This generates:

```text
myproject.json
```

### 3. Specify the output file

```bash
python knxproj_to_json.py myproject.knxproj -o knxConfig.json
```

---

## 🔐 Password-Protected Projects

For password-protected ETS projects:

```bash
python knxproj_to_json.py myproject.knxproj \
    --password "my-password"
```

> **Tip:** Avoid putting passwords directly into shell history when possible.
> Prefer a secure environment or interactive mechanism for production
> workflows.

---

## 🌍 Project Language

A specific project language can be selected during parsing:

```bash
python knxproj_to_json.py myproject.knxproj \
    --language en-US
```

---

## 📦 What Gets Extracted?

`xknxproject` exposes substantially more information than just group
addresses.

Depending on the ETS project and installed `xknxproject` version, the parsed
project can contain:

| Category            | Examples                           |
| ------------------- | ---------------------------------- |
| **Topology**        | Areas, lines                       |
| **Devices**         | Individual addresses, device names |
| **Channels**        | Device channels                    |
| **Communication**   | Communication-object instances     |
| **Group Addresses** | Group address, name                |
| **Datapoints**      | Group-address DPTs                 |
| **Object Metadata** | Communication-object flags         |
| **Applications**    | Application-program objects        |
| **Locations**       | Rooms, device locations            |
| **Functions**       | Functions assigned to rooms        |
| **Modules**         | Application/module information     |

The exact fields depend on the source ETS project and the version of
`xknxproject` used to parse it.

---

## 🧩 Example Parsed Data

Conceptually, the parser can expose data similar to:

```json
{
  "devices": {
    "1.1.1": {
      "name": "Living Room Switch",
      "manufacturer_name": "MDT"
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
```

> The actual structure depends on the ETS project and `xknxproject`
> version.

---

# 🎯 Recommended Application Architecture

If the generated JSON is going to be consumed by an application such as an
ESP-based KNX device, automation controller, or embedded gateway, it is
recommended **not to expose the complete `KNXProject` dictionary directly**.

Instead, treat `xknxproject` as the **ETS parsing layer** and transform its
output into your application's own stable schema.

```text
        ETS Project
        (.knxproj)
             │
             ▼
     ┌─────────────────┐
     │  xknxproject    │
     │   ETS parser    │
     └────────┬────────┘
              │
              ▼
       Parsed KNX data
              │
              ▼
     ┌─────────────────┐
     │ Application     │
     │ schema / mapper │
     └────────┬────────┘
              │
              ▼
        knxConfig.json
              │
       ┌──────┴──────┐
       ▼             ▼
   ESP / MCU     Application
```

### Why use an application schema?

This keeps your application independent from the internal data model of
`xknxproject`.

Benefits include:

* ✅ Stable configuration format
* ✅ Easier versioning
* ✅ Smaller JSON files
* ✅ Easier embedded-system integration
* ✅ Reduced coupling to the parser
* ✅ Freedom to change the parser later

---

## 🛠️ Example Application Schema

A simplified transformation can look like this:

```python
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
```

The resulting configuration can then be serialized:

```python
import json

project = XKNXProj("myproject.knxproj").parse()

config = create_knx_config(project)

with open("knxConfig.json", "w", encoding="utf-8") as f:
    json.dump(
        config,
        f,
        indent=2,
        ensure_ascii=False,
    )
```

---

## 📁 Example Output

```text
project/
├── knxproj_to_json.py
├── README.md
│
├── myproject.knxproj
│
└── knxConfig.json
```

The generated `knxConfig.json` is intended to become the application's
**portable KNX configuration**, rather than an implementation-specific dump
of the ETS parser.

---

## 🔗 Based On

This project uses:

**[XKNX — xknxproject](https://github.com/XKNX/xknxproject)**

`xknxproject` provides the underlying ETS project parser. This project adds a
small conversion layer around it so the resulting information can be used by
other applications.

---

## 📋 Requirements

* Python **3.10+**
* [`xknxproject`](https://github.com/XKNX/xknxproject)
* An ETS `.knxproj` project file

The underlying parser supports ETS project formats from **ETS 4, ETS 5 and
ETS 6**.

---

## ⚠️ Notes

### ETS project contents vary

Not every `.knxproj` contains the same information.

The generated JSON therefore depends on:

* ETS project configuration
* Devices and applications included in the project
* Communication objects
* Group-address configuration
* Project language
* `xknxproject` version

Do not assume that every project will contain every optional field.

### Keep the application schema stable

If `knxConfig.json` is consumed by firmware or another application, consider
treating the schema as an API.

For example:

```json
{
  "version": "1.0",
  "devices": [],
  "communication_objects": [],
  "group_addresses": []
}
```

When the schema changes, increment the version rather than silently changing
the meaning of existing fields.

---

## 🧪 Development

Clone the repository:

```bash
git clone https://github.com/betamoojw/knxproj_to_json.git
cd knxproj_to_json
```

Install the dependency:

```bash
pip install xknxproject
```

Run the converter:

```bash
python knxproj_to_json.py myproject.knxproj
```

---

## 📚 Resources

* [XKNX](https://github.com/XKNX)
* [xknxproject](https://github.com/XKNX/xknxproject)
* [KNX Association](https://www.knx.org/)

---

## 📄 License

See the repository license for licensing information.

---

<p align="center">
  <sub>Built for KNX, ETS and automation projects.</sub>
</p>
