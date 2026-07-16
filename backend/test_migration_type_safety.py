import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from database.session import _sanitize_col_type


class MigrationTypeSafetyTest(unittest.TestCase):
    def test_postgres_timestamptz_is_allowed_for_declared_migrations(self):
        self.assertEqual(_sanitize_col_type("TIMESTAMPTZ"), "TIMESTAMPTZ")

    def test_decimal_columns_with_precision_and_defaults_are_allowed(self):
        self.assertEqual(_sanitize_col_type("NUMERIC(12,2) DEFAULT 0.0"), "NUMERIC(12,2) DEFAULT 0.0")

    def test_unsafe_type_is_still_rejected(self):
        with self.assertRaises(ValueError):
            _sanitize_col_type("TEXT; DROP TABLE users")


if __name__ == "__main__":
    unittest.main()
