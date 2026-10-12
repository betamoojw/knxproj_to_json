# knxConfig.json Analysis

## 1. Summary

`knxConfig.json` is a compact, application-oriented KNX configuration file. It does not resemble a raw `xknxproject` parser dump because it contains:

- KNX/IP connection settings
- One physical KNX address
- A curated `comObjects` array
- Human-readable IDs and descriptions
- Explicit read/write permissions
- Application-defined units

The file contains 76 communication objects covering lighting, dimming, curtains, HVAC, ventilation, heating, scenes, alarms, energy, sensors, and general KNX datapoint examples.

## 2. Top-Level Schema

| Property | Type | Required | Meaning |
|---|---|---:|---|
| `media_type` | string | Yes | KNX transport type. Current value: `knx_ip` |
| `media_parameters` | object | Yes | KNX/IP connection settings |
| `physical_address` | string | Yes | Physical KNX individual address |
| `comObjects` | array | Yes | Communication-object definitions |

### `media_parameters`

| Property | Type | Required | Current value |
|---|---|---:|---|
| `multicast_address` | string | Yes | `224.0.23.12` |
| `udp_port` | integer | Yes | `3671` |
| `transport_mode` | string | Yes | `routing` |
| `interface_identifier` | string | Yes | `KNX-IP-Interface` |
| `nat` | boolean | Yes | `false` |

## 3. Detailed Structure

Each `comObjects` item has the following structure:

| Property | Type | Nullable | Meaning |
|---|---|---:|---|
| `id` | string | No | Stable application identifier |
| `name` | string | No | Display name |
| `description` | string | No | Human-readable purpose |
| `group_address` | string | No | KNX three-level group address |
| `datapoint_type` | string | No | KNX DPT identifier |
| `readable` | boolean | No | Whether the object can be read |
| `writable` | boolean | No | Whether the object can be written |
| `unit` | string or `null` | Yes | Engineering unit such as `%`, `deg C`, or `kWh` |

All 76 communication objects currently contain every field. No property is absent in the observed file.

### Identifier formats

Observed examples:

```text
id: "living_room_light_command"
group_address: "1/0/1"
datapoint_type: "DPT-1.001"
physical_address: "15.15.199"
```

The implied formats are:

- Physical address: `area.line.device`
- Group address: `main/middle/sub`
- DPT: `DPT-main.sub`
- Object ID: lowercase descriptive slug using underscores

### KNX meaning

`datapoint_type` identifies the KNX encoding and semantic subtype. Examples include:

- `DPT-1.001`: boolean switching
- `DPT-5.001`: percentage or 8-bit scaling
- `DPT-9.001`: temperature
- `DPT-17.001`: scene number
- `DPT-20.102`: HVAC mode
- `DPT-13.013`: energy or accumulated value

The `unit` property is application metadata. It is not automatically derived from `datapoint_type`, so the file can contain semantic mismatches unless validated separately.

## 4. Relationships

There are no separate `devices`, `topology`, `locations`, `group_addresses`, or `functions` collections in this file.

The main relationship is:

```text
comObjects[].group_address
        |
        +-- KNX group address used for communication
```

Each communication object currently has:

- One unique `id`
- One unique `group_address`
- One DPT
- Read/write permissions

Observed relationship facts:

- 76 communication objects
- 76 unique IDs
- 76 unique group addresses
- No duplicate group addresses
- No explicit object-to-device relationship
- No explicit command/status pairing field
- Command/status relationships are inferred from naming conventions and address ranges

For example:

```text
living_room_light_command
living_room_light_status
```

These appear conceptually related, but the relationship is not formally represented.

`physical_address` identifies the KNX interface or device address used by the application. It is not referenced by any communication object.

## 5. Actual Contents

### Counts

| Category | Count |
|---|---:|
| Top-level properties | 4 |
| Communication objects | 76 |
| Unique IDs | 76 |
| Unique group addresses | 76 |
| Objects with `unit: null` | 40 |
| Readable objects | 61 |
| Writable objects | 47 |
| Both readable and writable | 32 |
| Read-only objects | 29 |
| Write-only objects | 15 |

### DPT distribution

| DPT | Count |
|---|---:|
| `DPT-1.001` | 12 |
| `DPT-5.001` | 8 |
| `DPT-9.001` | 7 |
| `DPT-1.008` | 4 |
| `DPT-9.008` | 3 |
| `DPT-11.001` | 2 |
| `DPT-17.001` | 2 |
| `DPT-20.102` | 2 |
| `DPT-20.105` | 2 |
| Other DPTs | 34 |

### Functional groups

The group-address ranges suggest:

- `1/*`: lighting commands and status
- `2/*`: dimming
- `3/*`: curtains and blinds
- `4/*`: air conditioning
- `5/*`: ventilation
- `6/*`: floor heating
- `7/*`: global house commands
- `8/*`: scenes and general building values
- `9/*`: general KNX datapoint examples and sensors

## 6. Issues and Risks

1. **No explicit schema version**

   There is no `version` field. A future change to property names or meanings could break consumers silently.

2. **`comObjects` naming is inconsistent with common Python style**

   The top-level property uses camelCase while the nested properties use snake_case. This is valid, but should be documented as an intentional public API choice.

3. **No formal uniqueness enforcement**

   IDs and group addresses are unique in this file, but JSON Schema cannot reliably enforce uniqueness by object property. Application-level validation is still required.

4. **No explicit device model**

   The configuration identifies a physical KNX address but does not describe the physical device, manufacturer, channels, or application program.

5. **No explicit group-address metadata**

   Group addresses only exist inside communication objects. There is no centralized group-address table containing names, comments, security, or descriptions.

6. **Command/status relationships are implicit**

   Pairings such as command/status or setpoint/temperature are inferred from IDs and names rather than represented explicitly.

7. **Units are not validated against DPTs**

   The `unit` field is free-form and nullable. A future configuration could assign an invalid unit for a given DPT.

8. **DPT validation is syntactic only**

   A pattern can validate strings such as `DPT-9.001`, but cannot confirm that the DPT exists or that its semantic meaning is correct.

9. **Potential semantic inconsistencies should be reviewed**

   Several names, units, and DPT values appear intentionally broad or demonstrative. For production use, verify each DPT against the KNX specification and the target device implementation.

10. **No configuration for retry, timeout, connection state, or security**

    The file contains basic routing settings but no operational connection policy.

## 7. Recommended Stable Application Schema

For long-term application use, consider adding:

```json
{
  "schema_version": "1.0",
  "media": {
    "type": "knx_ip",
    "parameters": {}
  },
  "interface": {
    "physical_address": "15.15.199"
  },
  "devices": [],
  "group_addresses": [],
  "communication_objects": [],
  "relationships": []
}
```

Recommended improvements:

- Rename `comObjects` to `communication_objects`, or formally document the existing name.
- Add `schema_version`.
- Keep communication objects separate from group-address definitions.
- Add explicit object roles such as `command`, `status`, `setpoint`, or `measurement`.
- Add explicit relationships such as `paired_object_id`.
- Add optional device and channel information.
- Validate DPT and unit combinations.
- Validate unique IDs and group addresses in application code.
- Add connection settings such as timeout, retry count, and secure tunneling/routing options.

## 8. Formal JSON Schema

The following schema describes the observed structure and uses JSON Schema Draft 2020-12.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/knxConfig.schema.json",
  "title": "KNX Application Configuration",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "media_type",
    "media_parameters",
    "physical_address",
    "comObjects"
  ],
  "properties": {
    "media_type": {
      "type": "string",
      "enum": [
        "knx_ip"
      ]
    },
    "media_parameters": {
      "$ref": "#/$defs/mediaParameters"
    },
    "physical_address": {
      "$ref": "#/$defs/physicalAddress"
    },
    "comObjects": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/communicationObject"
      }
    }
  },
  "$defs": {
    "physicalAddress": {
      "type": "string",
      "pattern": "^(?:[0-9]|1[0-5])\\.(?:[0-9]|1[0-5])\\.(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$",
      "description": "KNX individual address in area.line.device format."
    },
    "groupAddress": {
      "type": "string",
      "pattern": "^(?:[0-9]|[12][0-9]|3[01])\\/[0-7]\\/(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$",
      "description": "KNX three-level group address."
    },
    "datapointType": {
      "type": "string",
      "pattern": "^DPT-[0-9]{1,2}\\.[0-9]{3}$",
      "description": "KNX datapoint type identifier."
    },
    "objectId": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$",
      "minLength": 1,
      "description": "Stable application-level communication-object identifier."
    },
    "mediaParameters": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "multicast_address",
        "udp_port",
        "transport_mode",
        "interface_identifier",
        "nat"
      ],
      "properties": {
        "multicast_address": {
          "type": "string",
          "format": "ipv4"
        },
        "udp_port": {
          "type": "integer",
          "minimum": 1,
          "maximum": 65535
        },
        "transport_mode": {
          "type": "string",
          "enum": [
            "routing",
            "tunneling"
          ]
        },
        "interface_identifier": {
          "type": "string",
          "minLength": 1
        },
        "nat": {
          "type": "boolean"
        }
      }
    },
    "communicationObject": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "name",
        "description",
        "group_address",
        "datapoint_type",
        "readable",
        "writable",
        "unit"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/objectId"
        },
        "name": {
          "type": "string",
          "minLength": 1
        },
        "description": {
          "type": "string"
        },
        "group_address": {
          "$ref": "#/$defs/groupAddress"
        },
        "datapoint_type": {
          "$ref": "#/$defs/datapointType"
        },
        "readable": {
          "type": "boolean"
        },
        "writable": {
          "type": "boolean"
        },
        "unit": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    }
  }
}
```

The formal schema validates the shape and basic syntax. It does not enforce uniqueness of `id` or `group_address`, nor does it validate whether a unit is semantically correct for a particular DPT. Those checks require custom application validation.
