import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from services.places import PlaceRecord, format_place_result, normalize_place_query
from scripts.import_geonames_places import batch_size_for_dialect
from scripts.import_geonames_places import selected_country_codes
from scripts.import_geonames_places import should_index_row


class PlacesContractTest(unittest.TestCase):
    def test_format_place_result_keeps_canonical_metadata(self):
        place = PlaceRecord(
            geoname_id="1795565", name="Hangzhou", name_zh="杭州", country_code="CN",
            country_name="China", country_name_zh="中国", admin1="Zhejiang", admin1_zh="浙江省",
            latitude=30.29365, longitude=120.16142, timezone="Asia/Shanghai", population=9236032,
        )

        result = format_place_result(place, "zh")

        self.assertEqual(result["id"], "1795565")
        self.assertEqual(result["display_name"], "杭州 · 浙江省 · 中国")
        self.assertEqual(result["timezone"], "Asia/Shanghai")
        self.assertTrue(result["is_verified"])

    def test_normalize_place_query_requires_two_meaningful_characters(self):
        self.assertEqual(normalize_place_query(" 杭 "), "")
        self.assertEqual(normalize_place_query(" 杭州 "), "杭州")
        self.assertEqual(normalize_place_query("  New   York  "), "new york")

    def test_format_place_result_hides_numeric_admin_codes(self):
        place = PlaceRecord(
            geoname_id="1850147", name="Tokyo", name_zh=None, country_code="JP",
            country_name="Japan", country_name_zh=None, admin1="40", admin1_zh=None,
            latitude=35.6895, longitude=139.69171, timezone="Asia/Tokyo", population=9733276,
        )

        self.assertEqual(format_place_result(place, "en")["display_name"], "Tokyo · Japan")


    def test_postgres_import_batch_stays_within_asyncpg_argument_limit(self):
        # The importer inserts 15 columns per place. asyncpg permits at most
        # 32,767 bind parameters in one statement.
        self.assertLessEqual(batch_size_for_dialect("postgresql") * 15, 32767)

    def test_mainstream_country_selection_is_limited_and_overridable(self):
        defaults = selected_country_codes(None)
        self.assertIn("CN", defaults)
        self.assertIn("US", defaults)
        self.assertNotIn("AQ", defaults)
        self.assertEqual(selected_country_codes("cn, us"), {"CN", "US"})

    def test_location_index_excludes_tiny_settlements_but_keeps_country_admin_records(self):
        tiny_town = ["", "", "", "", "", "", "P", "", "CN", "", "", "", "", "", "499"]
        city = ["", "", "", "", "", "", "P", "", "CN", "", "", "", "", "", "500"]
        country = ["", "", "", "", "", "", "A", "", "CN", "", "", "", "", "", "0"]
        self.assertFalse(should_index_row(tiny_town, {"CN"}, 500))
        self.assertTrue(should_index_row(city, {"CN"}, 500))
        self.assertTrue(should_index_row(country, {"CN"}, 500))


if __name__ == "__main__":
    unittest.main()
