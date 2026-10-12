import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class FrontendLocalizationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        cls.script = (ROOT / "web" / "app.js").read_text(encoding="utf-8")

    def test_required_locales_exist(self) -> None:
        for locale in ("en", "zh-CN", "zh-TW"):
            pattern = re.compile(
                rf"^\s*(?:'{locale}'|{re.escape(locale)}):",
                re.MULTILINE,
            )
            self.assertRegex(self.script, pattern)

    def test_html_translation_keys_exist_in_catalog(self) -> None:
        keys = set(re.findall(r'data-i18n(?:-[a-z-]+)?="([^"]+)"', self.html))
        missing = [key for key in sorted(keys) if f"'{key}'" not in self.script]
        self.assertEqual(missing, [])

    def test_project_data_files_are_not_marked_for_translation(self) -> None:
        self.assertNotIn('data-i18n="json', self.html)
        self.assertNotIn('data-i18n="project', self.html)


if __name__ == "__main__":
    unittest.main()
