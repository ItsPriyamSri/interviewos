---
name: interviewos-ledger
description: JSONL evidence schema, source classes, citation and contradiction rules for the InterviewOS evidence ledger. Load when writing or merging evidence.jsonl rows or citing them in markdown.
---

# InterviewOS Ledger

`evidence.jsonl` is the workspace's source of truth. One JSON object per line.

## Schema

```json
{
  "id": "E001",
  "claim": "string, atomic, checkable",
  "topic": "role | loop | tech | dsa",
  "source_url": "string, https URL; empty ONLY if class is inferred",
  "source_title": "string",
  "retrieved_at": "ISO-8601 timestamp of retrieval",
  "class": "official | first_party | second_party | anecdote | inferred",
  "quote": "short span actually retrieved; empty if inferred",
  "verdict": "supported | partial | unsupported | contradicted",
  "notes": "string"
}
```

## Rules

- IDs are `E###` (three digits), unique per workspace, stable for the session (`E001`, `E002`, …).
- `verdict: supported` requires a real `source_url` the tools actually retrieved this session. Prior knowledge is `inferred`, never `supported`.
- Classes:
  - `official` — careers page, JD, company engineering blog, official interview guide
  - `first_party` — company employees in official or clearly affiliated channels
  - `second_party` — reputable reporting, well-known prep sites citing a source
  - `anecdote` — Blind, Reddit, Glassdoor, random YouTube
  - `inferred` — model extrapolation; no URL, no quote
- Contradictions are **two rows**, not an average.
- One atomic claim per row. "Google SRE interviews include a coding round" — yes. "Google hires SREs and they do coding and system design" — no, split it.

## Merging subagent output (Code Mode)

When subagents return candidate rows, merge in the sandbox:

- Deduplicate by claim similarity; keep the row with the better class/verdict and record the merge in `notes`.
- Renumber ids sequentially if needed; keep a mapping so citations stay consistent.
- A skeptic must never leave `verdict: supported` on a row whose URL was not fetched this session.

## Citation rules (markdown files)

- Every factual sentence in `brief.md`, `gaps.md`, `plan.md` cites its row: `[^E00x]`.
- No row to cite? Tag the sentence `[INFERRED]`.
- Anecdotes may appear but must stay attributed to their class; never phrase an anecdote as "the company's process is X" unless `official` or `first_party` supports it.

## Validation

Before publish, run:

```bash
python3 scripts/check_ledger.py <workspace_dir>
```

Exit 0 required. The `publish_workspace` tool runs this check itself and rejects broken citations.
