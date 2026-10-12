# Agent Prompt: Multilingual KNX Web Interface

Extend the existing KNX Project to JSON web interface with multilingual UI support.

Use these existing files as the implementation source of truth:

- `web_app.py`
- `web/index.html`
- `web/app.js`
- `web/styles.css`
- `README.md`
- `doc/web_frontend_agent_prompt.md`

## Goal

Add runtime language switching to the web frontend without changing the JSON conversion schema or the existing backend conversion behavior.

The interface must support at minimum:

- English
- Simplified Chinese (`zh-CN`)
- Traditional Chinese (`zh-TW`)

Design the localization system so additional languages can be added without rewriting the UI logic. Add at least one clearly documented extension point for future locales such as German, French, Spanish, or Japanese.

## Required Behavior

1. Add a visible language selector in the application header or setup step.
2. Allow the user to switch languages without reloading the page.
3. Translate all user-facing interface text, including:
   - Brand subtitle
   - Page heading and supporting copy
   - Step labels and descriptions
   - Backend status messages
   - Setup instructions
   - Environment labels
   - File picker and drag-and-drop text
   - Password and language labels
   - Privacy and upload notices
   - Conversion stages and progress messages
   - Review and editor controls
   - Validation messages
   - Export and download actions
   - Empty states
   - Error messages
   - Accessibility labels and status announcements
   - Footer text
4. Preserve technical values and file formats across languages:
   - `.knxproj`
   - `knxConfig.json`
   - `knxConfigTemp.json`
   - KNX group addresses
   - DPT identifiers
   - API paths
   - Python commands
5. Do not translate JSON property names, IDs, DPT identifiers, group addresses, or generated configuration data.
6. Do not translate user-provided project names, device names, communication-object names, descriptions, or raw parser output.
7. Keep the optional ETS project language field separate from the web interface language selector. The interface language controls the browser UI; the project language controls how the ETS project is parsed.

## Localization Architecture

Create a centralized translation catalog rather than embedding translated strings throughout event handlers.

A suitable structure is:

```javascript
const translations = {
  "en": {
    "app.title": "KNX Project",
    "app.subtitle": "to JSON",
    "steps.setup": "Setup",
    "steps.import": "Import",
    "steps.convert": "Convert",
    "steps.review": "Review",
    "steps.export": "Export"
  },
  "zh-CN": {
    "app.title": "KNX 项目",
    "app.subtitle": "转换为 JSON",
    "steps.setup": "设置",
    "steps.import": "导入",
    "steps.convert": "转换",
    "steps.review": "检查",
    "steps.export": "导出"
  },
  "zh-TW": {
    "app.title": "KNX 專案",
    "app.subtitle": "轉換為 JSON",
    "steps.setup": "設定",
    "steps.import": "匯入",
    "steps.convert": "轉換",
    "steps.review": "檢查",
    "steps.export": "匯出"
  }
};
```

Use stable translation keys and a `t(key, variables)` helper. Missing translations must fall back to English rather than displaying undefined keys.

Use interpolation for dynamic messages instead of concatenating translated fragments, for example:

```javascript
t("conversion.ready", { count: summary.communication_objects })
```

The interpolation system must safely escape values before inserting them into HTML. User-provided values must never be interpreted as HTML.

## Language Selection

Provide language options with native names:

- English
- 简体中文
- 繁體中文

The selected language should be persisted in `localStorage` and restored on the next visit.

Recommended selection priority:

1. Explicit language saved by the user
2. Browser language when a supported locale matches
3. English fallback

Do not automatically switch away from a language explicitly selected by the user.

Update the document language attribute whenever the locale changes:

```javascript
document.documentElement.lang = "zh-CN";
```

Use `dir="ltr"` explicitly unless a future locale requires a different direction.

## HTML Integration

Mark every translatable element with a stable key, for example:

```html
<h1 data-i18n="hero.title"></h1>
<p data-i18n="hero.description"></p>
<button data-i18n="actions.validate"></button>
```

For accessibility attributes use dedicated translation attributes, for example:

```html
<input
  data-i18n-placeholder="import.passwordPlaceholder"
  data-i18n-aria-label="import.passwordLabel"
>
```

The localization pass must update:

- Text content
- `placeholder`
- `aria-label`
- `aria-description`
- `title`
- `alt`
- `data-label` values used by responsive layouts

Do not use visible flag icons as the only language indicator. Use native language names in the selector.

## Chinese Typography and Layout

Ensure Simplified and Traditional Chinese render correctly on Windows and common browsers.

- Use a font stack with CJK-capable fallbacks.
- Do not assume Latin word spacing.
- Allow Chinese headings and button labels to wrap naturally.
- Ensure translated labels do not overflow buttons, cards, or the stepper.
- Keep controls usable at narrow mobile widths.
- Preserve readable line height for Chinese text.
- Avoid hardcoded widths based on English label lengths.
- Verify the editor and JSON content remain monospace and unchanged.

The visual direction should remain consistent across languages. Do not create separate layouts for Chinese unless a measured layout issue requires it.

## Backend Messages

The backend API may continue returning stable machine-readable error codes and English fallback messages. The frontend must translate known error codes or message categories into the selected UI language.

Prefer structured errors such as:

```json
{
  "error": {
    "code": "INVALID_PROJECT_PASSWORD",
    "message": "The KNX project password is invalid."
  }
}
```

Do not translate or alter technical values embedded in errors, such as filenames, group addresses, DPTs, IDs, or API paths.

Maintain compatibility with existing plain-string error responses while adding structured codes where practical.

## Formatting and Data Rules

- Keep JSON output language-neutral.
- Do not translate generated `comObjects` values.
- Do not modify `knxConfig.json` or `knxConfigTemp.json` based on the selected UI language.
- Keep `media_type`, `media_parameters`, `physical_address`, and `comObjects` unchanged.
- Keep ETS project language selection independent from UI localization.
- Do not include localized labels inside downloaded configuration files.

## Testing Requirements

Add focused tests for:

1. English is the default fallback.
2. Simplified Chinese translations are available.
3. Traditional Chinese translations are available.
4. Missing translation keys fall back to English.
5. Language selection persists in `localStorage`.
6. Browser locale detection does not override an explicit saved selection.
7. Switching languages updates visible text without reloading.
8. Dynamic summary and error messages interpolate safely.
9. User-provided names and descriptions are not translated or treated as HTML.
10. JSON property names and values remain unchanged after language switching.
11. Long Chinese labels do not overflow the stepper or primary buttons.
12. Backend conversion and validation behavior remains unchanged.

Use browser tests where available. At minimum verify each locale at desktop and mobile widths.

## README Updates

Update `README.md` with:

- Supported interface languages
- How to change the interface language
- The distinction between interface language and ETS project language
- How to add a new locale
- The fallback behavior
- Test commands for localization

## Acceptance Criteria

The work is complete when:

- English, Simplified Chinese, and Traditional Chinese are selectable in the UI.
- The language changes without a page reload.
- The selected language persists across reloads.
- Every visible UI string has a translation key.
- Accessibility labels and placeholders are translated.
- Missing translations fall back to English.
- Chinese text is readable and does not cause layout overflow on desktop or mobile.
- User-generated JSON content remains unchanged.
- Conversion, validation, raw output, final output, and downloads still work.
- Existing backend tests pass.
- Localization tests pass.
- The application still starts with `python web_app.py`.

## Final Report

After implementation, report:

- Files changed
- Translation catalog structure
- Supported locale codes
- Persistence and fallback behavior
- Backend compatibility decisions
- Browser and automated test commands
- Desktop and mobile verification results
- Any untranslated or intentionally non-translated values
