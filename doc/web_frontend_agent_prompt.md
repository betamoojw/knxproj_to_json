# Agent Prompt: KNX Project JSON Web Interface

Build a complete web frontend and backend workflow for this repository so users can convert an ETS `.knxproj` project into editable JSON through a browser.

Use the existing project implementation as the source of truth:

- `knxproj_to_json.py`
- `README.md`
- `knxConfig_analysis.md`
- `knxConfigExample.json`
- Existing ETS fixtures under `test/`

The existing Python converter uses `xknxproject` and produces two outputs:

- `knxConfigTemp.json`: raw parser output
- `knxConfig.json`: application-oriented configuration containing `media_type`, `media_parameters`, `physical_address`, and `comObjects`

## Product Goal

Create a polished web application that lets a user:

1. Configure and verify the backend environment.
2. Import an ETS `.knxproj` file from the local computer.
3. Convert the project using the existing Python converter.
4. Display conversion progress and meaningful errors.
5. Inspect both raw and final JSON output.
6. Edit the final JSON in the browser.
7. Validate the edited configuration.
8. Download or save the edited JSON locally.

Do not replace the existing converter logic unless a backend integration change is required. Preserve its password handling, language selection, temporary-output behavior, final-output behavior, DPT mapping, group-address mapping, and validation behavior.

## Reference Design Direction

Use the ArduinoJson Assistant as a workflow reference:

https://arduinojson.org/v7/assistant/

Study its staged assistant flow, especially:

- Step-oriented progression
- Clear configuration before processing
- Focused controls instead of a crowded dashboard
- Next/back navigation
- Strong distinction between input, processing, and generated output
- Useful generated-result presentation
- Immediate feedback when configuration is incomplete

Do not copy its source code, branding, text, or visual assets. Reinterpret the interaction model for KNX project conversion.

## Required Workflow

Design the frontend as a guided multi-step assistant:

### Step 1: Backend Setup

Provide a setup screen that explains how the backend works and helps the user verify prerequisites.

Show:

- Python version requirement
- `xknxproject` requirement
- Expected backend command or start command
- Current backend connection status
- Parser version when available
- Clear setup instructions for Windows and common terminal usage
- A backend health check button
- Useful error messages when Python or `xknxproject` is unavailable

The setup screen must not pretend that browser JavaScript can parse `.knxproj` files by itself. The conversion must run through the Python backend.

### Step 2: Import Project

Allow the user to select an ETS `.knxproj` file from the local computer.

Include:

- File picker with `.knxproj` filtering
- Selected filename and file size
- Drag-and-drop support if practical
- Optional project password field
- Optional project language field
- Clear indication that the file is uploaded only for conversion
- Upload and conversion action
- Disabled states while processing
- Password visibility toggle
- Validation for missing files and unsupported extensions

Do not expose uploaded project files or passwords in client-side logs.

### Step 3: Conversion

Show a focused progress view while the backend converts the project.

Display meaningful stages such as:

1. Uploading project
2. Parsing ETS project
3. Writing temporary parser output
4. Mapping communication objects
5. Validating application configuration
6. Preparing JSON result

The backend should use the existing two-stage model:

```text
ETS .knxproj
    -> xknxproject parser
    -> knxConfigTemp.json
    -> application mapper
    -> knxConfig.json
```

Return structured errors for:

- Missing or invalid file
- Wrong password
- Unsupported project data
- Invalid group addresses
- Missing communication-object links
- Invalid DPT data
- Backend dependency failures
- Conversion exceptions

### Step 4: Review and Edit JSON

Display the generated final `knxConfig.json` in an editable JSON editor.

The editor must support:

- Syntax highlighting
- Formatting and indentation
- JSON syntax validation
- Search
- Line numbers
- Clear invalid JSON feedback
- Reset to the generated version
- Undo/redo where supported
- Readable display of long `comObjects` arrays
- Mobile-friendly horizontal scrolling or responsive layout

Provide a structured summary beside or above the editor:

- Media type
- Physical address
- Communication-object count
- Unique ID count
- Unique group-address count
- Number of readable objects
- Number of writable objects
- Number of objects with units
- DPT distribution when practical

Validate the edited JSON against the application schema documented in `knxConfig_analysis.md`.

At minimum validate:

- Required top-level fields
- `media_type`
- `media_parameters`
- KNX physical address format
- `comObjects` array
- Required communication-object fields
- Boolean `readable` and `writable` values
- Nullable or string `unit`
- KNX group-address format
- DPT string format
- Unique communication-object IDs

### Step 5: Export

Provide actions to:

- Download the edited JSON as `knxConfig.json`
- Download the raw parser output as `knxConfigTemp.json`
- Copy JSON to the clipboard
- Reformat JSON
- Validate again before download
- Start a new conversion

Do not silently download invalid JSON. Make the validation state visible and require the user to correct errors before exporting the final file.

## Backend API

Choose a backend approach that fits the repository and keep it small. A Python backend such as FastAPI or Flask is acceptable, but do not rewrite the existing converter into a second incompatible implementation.

Design clear endpoints, for example:

- `GET /api/health`
- `GET /api/environment`
- `POST /api/convert`
- `POST /api/validate`
- `GET /api/result/{conversion_id}` if asynchronous conversion is used
- `GET /api/download/{conversion_id}/config`
- `GET /api/download/{conversion_id}/temp`

The conversion endpoint should accept:

- `.knxproj` upload
- Optional password
- Optional language
- Optional temp output filename
- Optional final output filename

Return structured JSON responses rather than scraping terminal output.

Use temporary directories and generated conversion IDs. Do not use a shared fixed filename for concurrent users. Clean up uploaded files and generated temporary files after a reasonable retention period.

## Security and Reliability

Implement the following safeguards:

- Restrict uploads to `.knxproj`
- Enforce a configurable maximum upload size
- Store uploads outside the static frontend directory
- Never render uploaded project content as HTML
- Do not log passwords
- Avoid returning passwords in API errors
- Sanitize filenames
- Use unique temporary working directories
- Prevent path traversal
- Clean up failed conversions
- Validate JSON before download
- Return safe, user-readable error messages

If the app is intended only for local use, document that clearly, but still avoid unsafe file handling.

## Frontend Design

Create a purposeful tool interface rather than a generic landing page.

Use a visual language inspired by a technical assistant:

- Compact step indicator
- Clear current-step heading
- One dominant task per screen
- Strong primary action
- Secondary back/reset actions
- Technical but approachable typography
- Clear distinction between configuration, source input, generated output, and validation
- Dense information where users need comparison
- Responsive desktop and mobile layouts
- Accessible labels, keyboard navigation, focus states, and status announcements

Avoid:

- Marketing hero sections
- Decorative feature cards
- Unrelated illustrations
- Purple-gradient defaults
- Hidden validation errors
- Text-only controls where familiar icons are appropriate
- An editor that is too small to inspect real KNX configurations

Use an existing icon library when the chosen frontend stack supports one.

## Implementation Requirements

Before editing:

1. Inspect the existing repository and determine the current Python environment and dependency setup.
2. Inspect the current converter API and preserve its behavior.
3. Inspect `knxConfig_analysis.md` and use it as the final configuration contract.
4. Identify whether a frontend framework already exists. If not, choose a lightweight maintainable stack.
5. State one concrete implementation hypothesis and one cheap validation check.

During implementation:

- Keep frontend and backend responsibilities separate.
- Keep conversion logic in Python.
- Reuse `create_knx_config()` and existing validation where appropriate.
- Add only the abstractions needed for the web workflow.
- Keep API responses typed and predictable.
- Add focused tests for conversion endpoints and JSON validation.
- Add frontend tests for import, progress, edit, validation, and download behavior where the stack supports them.
- Update README.md with installation, backend startup, frontend startup, and usage instructions.

## Acceptance Criteria

The work is complete when:

- The backend can be installed from documented instructions.
- The web interface starts locally.
- The backend health status is visible in the UI.
- A user can select a local `.knxproj` file.
- A password-protected project can receive a password securely.
- A language can be selected.
- The project is converted through the existing Python logic.
- Both raw and final JSON outputs are available.
- The final JSON is displayed in an editable editor.
- Invalid edits are clearly reported.
- Valid edits can be downloaded as `knxConfig.json`.
- The original generated result can be restored.
- The UI works on desktop and mobile widths.
- The module-definition fixture and at least one password-free fixture are tested.
- Python compilation, backend tests, frontend tests, and a production build pass.
- No user-generated files are deleted or overwritten unexpectedly.

## Final Report

After implementation, report:

- Files changed
- Backend framework and frontend framework selected
- Installation commands
- Startup commands
- Local URL
- API endpoints
- Test commands and results
- Which fixtures were tested
- Any known limitations
- Whether both `knxConfigTemp.json` and `knxConfig.json` were verified
