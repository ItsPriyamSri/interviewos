"""CLI tests for scripts/check_ledger.py (subprocess, same entrypoint as sandbox)."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / "scripts" / "check_ledger.py"

REQUIRED = (
    "id",
    "claim",
    "topic",
    "source_url",
    "source_title",
    "retrieved_at",
    "class",
    "quote",
    "verdict",
    "notes",
)


def row(**overrides):
    base = {
        "id": "E001",
        "claim": "SRE interviews include a reliability design round.",
        "topic": "loop",
        "source_url": "https://example.com/sre",
        "source_title": "Example",
        "retrieved_at": "2026-08-24T00:00:00Z",
        "class": "official",
        "quote": "reliability design",
        "verdict": "supported",
        "notes": "",
    }
    base.update(overrides)
    return base


def write_workspace(dirpath: Path, rows, brief="", gaps="", plan=""):
    (dirpath / "evidence.jsonl").write_text(
        "".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8"
    )
    if brief is not None:
        (dirpath / "brief.md").write_text(brief, encoding="utf-8")
    if gaps is not None:
        (dirpath / "gaps.md").write_text(gaps, encoding="utf-8")
    if plan is not None:
        (dirpath / "plan.md").write_text(plan, encoding="utf-8")


def run_checker(dirpath: Path):
    return subprocess.run(
        [sys.executable, str(CHECKER), str(dirpath)],
        capture_output=True,
        text=True,
    )


class CheckLedgerTests(unittest.TestCase):
    def test_checker_script_exists(self):
        self.assertTrue(CHECKER.is_file(), f"missing {CHECKER}")

    def test_valid_workspace_exits_0(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row()],
                brief="Google SRE includes a reliability round [^E001].\n",
                gaps="No Kubernetes ops evidence [^E001].\n",
                plan="P0: practice reliability design [^E001].\n",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 0, proc.stderr)

    def test_missing_citation_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row()],
                brief="Invented stage [^E999].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("E999", proc.stderr)

    def test_supported_without_url_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(source_url="", verdict="supported")],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("source_url", proc.stderr)

    def test_duplicate_ids_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(), row(claim="other")],
                brief="Both [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("duplicate", proc.stderr.lower())

    def test_supported_non_http_url_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(source_url="ftp://example.com/sre")],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("source_url", proc.stderr)

    def test_supported_inferred_class_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(**{"class": "inferred", "verdict": "supported", "source_url": "https://example.com"})],
                brief="Nope [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)

    def test_missing_required_field_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            r = row()
            del r["retrieved_at"]
            write_workspace(
                d,
                [r],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("retrieved_at", proc.stderr)

    def test_bad_topic_or_verdict_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(topic="vibes")],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)

    def test_malformed_jsonl_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "evidence.jsonl").write_text("{not json}\n", encoding="utf-8")
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)

    def test_missing_evidence_file_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)

    def test_empty_markdown_files_ok(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(verdict="partial")],
                brief=None,
                gaps=None,
                plan=None,
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 0, proc.stderr)

    def test_unhashable_id_does_not_crash(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(**{"id": []})],
                brief="",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("E###", proc.stderr)

    def test_unhashable_topic_does_not_crash(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(**{"topic": {}})],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("must be string", proc.stderr)

    def test_non_inferred_partial_without_url_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row(source_url="", verdict="partial", **{"class": "official"})],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("source_url", proc.stderr)

    def test_short_id_format_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            r = row()
            r["id"] = "E1"
            write_workspace(
                d,
                [r],
                brief="Claim [^E1].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)

    def test_short_citation_exits_1_even_if_row_exists(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            r = row()
            r["id"] = "E1"
            write_workspace(
                d,
                [r],
                brief="Claim [^E1].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)

    def test_malformed_citation_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            write_workspace(
                d,
                [row()],
                brief="Claim exists as [^E001] but this is [^E01].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("malformed citation", proc.stderr)

    def test_non_string_claim_exits_1(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            r = row()
            r["claim"] = {"text": "nonsense"}
            write_workspace(
                d,
                [r],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("must be string", proc.stderr)

    def test_missing_fields_row_still_counts_as_known_id(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            r = row()
            del r["notes"]
            write_workspace(
                d,
                [r],
                brief="Claim [^E001].\n",
                gaps="",
                plan="",
            )
            proc = run_checker(d)
            self.assertEqual(proc.returncode, 1)
            self.assertIn("missing field", proc.stderr)
            self.assertNotIn("not in ledger", proc.stderr)


if __name__ == "__main__":
    unittest.main()
