import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class FrontendLocalizationTests(unittest.TestCase):
    locales = ("en", "de", "es", "fr", "pl", "zh-CN", "zh-TW")

    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        cls.script = (ROOT / "web" / "app.js").read_text(encoding="utf-8")

    def test_required_locales_exist(self) -> None:
        for locale in self.locales:
            pattern = re.compile(
                rf"^\s*(?:'{locale}'|{re.escape(locale)}):",
                re.MULTILINE,
            )
            self.assertRegex(self.script, pattern)

    def test_language_selector_contains_every_locale(self) -> None:
        for locale in self.locales:
            self.assertIn(f'<option value="{locale}">', self.html)

    def test_all_locales_match_english_translation_keys(self) -> None:
        catalogs = {}
        for locale in self.locales:
            match = re.search(
                rf"^\s*(?:'{re.escape(locale)}'|{re.escape(locale)}):\s*\{{",
                self.script,
                re.MULTILINE,
            )
            self.assertIsNotNone(match, f"Missing catalog for {locale}")
            start = match.end()
            end = self.script.index("\n  },", start)
            catalogs[locale] = set(
                re.findall(r"'([^']+)'\s*:", self.script[start:end])
            )

        for locale in self.locales[1:]:
            self.assertEqual(
                catalogs[locale],
                catalogs["en"],
                f"{locale} must contain exactly the English translation keys",
            )

    def test_browser_detection_covers_non_english_locales(self) -> None:
        for locale in self.locales[1:]:
            language_prefix = "zh" if locale.startswith("zh-") else locale
            self.assertIn(f"browserLocale.startsWith('{language_prefix}", self.script)

    def test_html_translation_keys_exist_in_catalog(self) -> None:
        keys = set(re.findall(r'data-i18n(?:-[a-z-]+)?="([^"]+)"', self.html))
        missing = [key for key in sorted(keys) if f"'{key}'" not in self.script]
        self.assertEqual(missing, [])

    def test_project_data_files_are_not_marked_for_translation(self) -> None:
        self.assertNotIn('data-i18n="json', self.html)
        self.assertNotIn('data-i18n="project', self.html)

    def test_locale_is_persisted_and_updates_document_language(self) -> None:
        self.assertIn("localStorage.setItem('knx-ui-language'", self.script)
        self.assertIn("localStorage.getItem('knx-ui-language'", self.script)
        self.assertIn("document.documentElement.lang = state.locale", self.script)

    def test_dynamic_messages_support_interpolation(self) -> None:
        self.assertIn("message.replace(/\\{(\\w+)\\}/g", self.script)
        self.assertIn("'validation.ready':", self.script)
        self.assertIn("t(validation.messageKey, validation.variables)", self.script)

    def test_technical_download_names_remain_language_neutral(self) -> None:
        self.assertIn("downloadBlob('knxConfig.json'", self.script)
        self.assertIn("/temp`", self.script)
        self.assertIn("knxConfig.json", self.html)
        self.assertIn("knxConfigTemp.json", self.html)

    def test_file_sizes_use_active_locale(self) -> None:
        self.assertIn("new Intl.NumberFormat(state.locale", self.script)


if __name__ == "__main__":
    unittest.main()
