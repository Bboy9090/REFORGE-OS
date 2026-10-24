"""Persistence regressions use isolated temporary stores, never customer files."""
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from cases import manager


class CaseStorageTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.cases = Path(self.directory.name) / "cases.json"
        self.devices = Path(self.directory.name) / "case_devices.json"
        self.patches = [
            patch.object(manager, "CASES_FILE", str(self.cases)),
            patch.object(manager, "DEVICES_FILE", str(self.devices)),
        ]
        for item in self.patches:
            item.start()
            self.addCleanup(item.stop)

    def test_new_store_roundtrips_case_status_and_device(self):
        case_id = manager.create_case("Customer", notes="Keep original contents")
        device_id = manager.add_device_to_case(case_id, "android", serial="fixture-1")
        self.assertTrue(manager.update_case_status(case_id, "in-progress"))
        self.assertEqual(manager.get_case(case_id)["status"], "in-progress")
        self.assertEqual(manager.get_device(device_id)["serial"], "fixture-1")
        self.assertEqual(len(manager.get_case_devices(case_id)), 1)

    def test_corrupt_case_store_blocks_new_case_without_overwriting(self):
        original = b'{"existing": {"customer_name": "Original"}'
        self.cases.write_bytes(original)
        with self.assertRaises(manager.CaseStorageError):
            manager.create_case("New customer")
        self.assertEqual(self.cases.read_bytes(), original)

    def test_invalid_record_shapes_are_preserved(self):
        for invalid in [[], None, {"id": "not a record"}]:
            with self.subTest(invalid=invalid):
                original = json.dumps(invalid).encode()
                self.cases.write_bytes(original)
                with self.assertRaises(manager.CaseStorageError):
                    manager.create_case("New customer")
                self.assertEqual(self.cases.read_bytes(), original)

    def test_corrupt_device_store_blocks_add_without_overwriting(self):
        case_id = manager.create_case("Customer")
        original = b'{"broken":'
        self.devices.write_bytes(original)
        with self.assertRaises(manager.CaseStorageError):
            manager.add_device_to_case(case_id, "ios")
        self.assertEqual(self.devices.read_bytes(), original)

    def test_read_error_is_not_treated_as_empty_store(self):
        with patch("builtins.open", side_effect=PermissionError("fixture")):
            with self.assertRaises(manager.CaseStorageError):
                manager.create_case("New customer")
        self.assertFalse(self.cases.exists())

    def test_failed_serialization_preserves_existing_store_and_removes_temp(self):
        case_id = manager.create_case("Original")
        original = self.cases.read_bytes()
        with self.assertRaises(manager.CaseStorageError):
            manager.update_case(case_id, notes=object())
        self.assertEqual(self.cases.read_bytes(), original)
        self.assertEqual(sorted(p.name for p in Path(self.directory.name).iterdir()), ["cases.json"])

    def test_failed_replace_preserves_previous_store_and_removes_temp(self):
        case_id = manager.create_case("Original")
        original = self.cases.read_bytes()
        with patch.object(manager.os, "replace", side_effect=OSError("fixture")):
            with self.assertRaises(manager.CaseStorageError):
                manager.update_case_status(case_id, "closed")
        self.assertEqual(self.cases.read_bytes(), original)
        self.assertEqual(sorted(p.name for p in Path(self.directory.name).iterdir()), ["cases.json"])

    def test_failed_flush_preserves_previous_store_and_removes_temp(self):
        manager.create_case("Original")
        original = self.cases.read_bytes()
        with patch.object(manager.os, "fsync", side_effect=OSError("fixture")):
            with self.assertRaises(manager.CaseStorageError):
                manager.create_case("New customer")
        self.assertEqual(self.cases.read_bytes(), original)
        self.assertEqual(sorted(p.name for p in Path(self.directory.name).iterdir()), ["cases.json"])

    @unittest.skipIf(os.name == "nt", "POSIX mode bits")
    def test_new_store_is_private(self):
        manager.create_case("Customer")
        self.assertEqual(self.cases.stat().st_mode & 0o777, 0o600)


if __name__ == "__main__":
    unittest.main()
