#!/usr/bin/env python3
"""Validate an InterviewOS workspace: evidence ledger + markdown citations.

Usage: python3 scripts/check_ledger.py <workspace_dir>
Exit 0 if valid, 1 otherwise. Violations print to stderr.

Ledger rules (docs/prd.md):
- evidence.jsonl: one JSON object per line with the full required schema.
- Unique stable ids (E001...).
- verdict "supported" requires a real http(s) source_url the tools retrieved.
- class "inferred" carries no URL and never a supported verdict.
Markdown rules:
- Every [^E00x] citation in brief.md / gaps.md / plan.md must exist in the ledger.
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path

REQUIRED_FIELDS = (
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

TOPICS = {"role", "loop", "tech", "dsa"}
CLASSES = {"official", "first_party", "second_party", "anecdote", "inferred"}
VERDICTS = {"supported", "partial", "unsupported", "contradicted"}

ID_RE = re.compile(r"^E\d{3}$")
CITATION_RE = re.compile(r"\[\^E\d{3}\]")
MARKDOWN_FILES = ("brief.md", "gaps.md", "plan.md")

STRING_FIELDS = (
    "id",
    "topic",
    "source_url",
    "retrieved_at",
    "class",
    "verdict",
)


def check_iso8601(value: str) -> bool:
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False


def check_ledger(path: Path) -> tuple[list[str], set]:
    problems: list[str] = []
    seen_ids: set = set()
    known_ids: set = set()

    if not path.is_file():
        return [f"missing {path}"], known_ids

    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            problems.append(f"{path.name}:{lineno}: malformed JSON ({exc})")
            continue
        if not isinstance(row, dict):
            problems.append(f"{path.name}:{lineno}: not a JSON object")
            continue

        rid = row.get("id")
        if not isinstance(rid, str) or not ID_RE.match(rid):
            problems.append(
                f"{path.name}:{lineno}: id must be a string in E### form"
            )
            continue
        where = f"{path.name}:{lineno} [{rid}]"

        if rid in seen_ids:
            problems.append(f"{path.name}:{lineno}: duplicate id {rid}")
        seen_ids.add(rid)
        known_ids.add(rid)

        missing = [f for f in REQUIRED_FIELDS if f not in row]
        if missing:
            problems.append(
                f"{where}: missing field(s) {', '.join(missing)}"
            )
            continue

        not_str = [
            f for f in STRING_FIELDS if not isinstance(row[f], str)
        ]
        if not_str:
            problems.append(
                f"{where}: field(s) must be string: "
                f"{', '.join(not_str)}"
            )
            continue

        if row["topic"] not in TOPICS:
            problems.append(f"{where}: bad topic {row['topic']!r}")
        if row["class"] not in CLASSES:
            problems.append(f"{where}: bad class {row['class']!r}")
        if row["verdict"] not in VERDICTS:
            problems.append(f"{where}: bad verdict {row['verdict']!r}")
        if not check_iso8601(str(row["retrieved_at"])):
            problems.append(f"{where}: retrieved_at not ISO-8601")

        url = str(row["source_url"]).strip()
        if row["class"] == "inferred":
            if url:
                problems.append(
                    f"{where}: class inferred must have empty source_url"
                )
            if row["verdict"] == "supported":
                problems.append(f"{where}: supported requires a source, not inference")
        else:
            if not url.startswith(("http://", "https://")):
                problems.append(
                    f"{where}: non-inferred rows need http(s) source_url"
                )

    return problems, known_ids


def check_markdown(workspace: Path, known_ids: set) -> list[str]:
    problems: list[str] = []
    for name in MARKDOWN_FILES:
        path = workspace / name
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for lineno, line in enumerate(text.splitlines(), start=1):
            for cite in CITATION_RE.findall(line):
                cid = cite[2:-1]  # strip [^ and ]
                if cid not in known_ids:
                    problems.append(
                        f"{name}:{lineno}: citation {cid} not in ledger"
                    )
    return problems


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: check_ledger.py <workspace_dir>", file=sys.stderr)
        return 1

    workspace = Path(argv[1])
    if not workspace.is_dir():
        print(f"not a directory: {workspace}", file=sys.stderr)
        return 1

    problems, known_ids = check_ledger(workspace / "evidence.jsonl")
    problems += check_markdown(workspace, known_ids)

    for problem in problems:
        print(problem, file=sys.stderr)
    if problems:
        print(f"check_ledger: {len(problems)} violation(s)", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
