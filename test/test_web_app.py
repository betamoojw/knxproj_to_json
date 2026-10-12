import json
import unittest
from pathlib import Path

from web_app import WebApplicationError, _validate_application_config, summarize_config


ROOT = Path(__file__).resolve().parents[1]


class WebApplicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with (ROOT / "knxConfigExample.json").open(encoding="utf-8") as file:
            cls.config = json.load(file)

    def test_example_configuration_matches_application_contract(self) -> None:
        validated = _validate_application_config(self.config)
        summary = summarize_config(validated)

        self.assertEqual(summary["communication_objects"], 76)
        self.assertEqual(summary["unique_ids"], 76)
        self.assertEqual(summary["unique_group_addresses"], 76)

    def test_duplicate_object_ids_are_rejected(self) -> None:
        invalid = json.loads(json.dumps(self.config))
        invalid["comObjects"][1]["id"] = invalid["comObjects"][0]["id"]

        with self.assertRaises(WebApplicationError):
            _validate_application_config(invalid)

    def test_invalid_dpt_is_rejected(self) -> None:
        invalid = json.loads(json.dumps(self.config))
        invalid["comObjects"][0]["datapoint_type"] = "temperature"

        with self.assertRaises(WebApplicationError):
            _validate_application_config(invalid)


if __name__ == "__main__":
    unittest.main()
