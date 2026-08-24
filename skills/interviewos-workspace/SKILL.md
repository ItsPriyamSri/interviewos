---
name: interviewos-workspace
description: Workspace file layout, gap rubric, P0/P1/P2 plan rules, and the exact publish_workspace call for InterviewOS. Load when drafting brief/gaps/plan files or publishing a workspace.
---

# InterviewOS Workspace

## File layout (only these four files)

```
interviewos/<slug>/
  evidence.jsonl    # source of truth (see interviewos-ledger)
  brief.md          # role + interview loop + tech/DSA, cited
  gaps.md           # candidate vs ledger (omit or mark N/A without resume)
  plan.md           # P0/P1/P2 only from cited gaps
```

`<slug>` is filesystem-safe `{company}-{role}`, lowercase with hyphens (e.g. `google-sre`).

Do not emit extra markdown files. Four quality files beat eight thin ones.

## brief.md

Sections: role summary; interview loop; tech/DSA expectations. Every factual
sentence cites `[^E###]` or is tagged `[INFERRED]`. Anecdotes stay tagged and
attributed to their class.

## gaps.md — gap rubric

Map resume evidence to ledger rows:

- For each ledger row that describes a requirement or expectation, check the resume for direct evidence of it.
- A **gap** row names: the requirement (`[^E###]`), what the resume shows instead, and severity.
- No resume provided? `gaps.md` contains exactly: "N/A — no resume provided." Do not invent a candidate.

## plan.md — P0/P1/P2

Only from cited gaps:

- **P0** — gap whose requirement row is `official`/`first_party` + `supported`, and clearly missing on the resume. These are must-do before the interview.
- **P1** — gap backed by `first_party`/`second_party` or verdict `partial`.
- **P2** — gap backed by `anecdote` or `inferred`.

Every plan item cites its gap and its evidence ids: `P0: rehearse reliability design rounds [^E003] [^G1]`. No unsourced "study Kubernetes".

## Publishing

Draft all files in the sandbox under `interviewos/<slug>/`. Then read each file's contents and call:

```json
{
  "tool": "publish_workspace",
  "arguments": {
    "slug": "<company>-<role>",
    "confirm": true,
    "files": [
      { "path": "evidence.jsonl", "content": "<full contents>" },
      { "path": "brief.md", "content": "<full contents>" },
      { "path": "gaps.md", "content": "<full contents>" },
      { "path": "plan.md", "content": "<full contents>" }
    ]
  }
}
```

The tool runs `scripts/check_ledger.py` on the payload and rejects broken citations. It requires human approval.

After calling it, **stop**. Never tell the user the workspace is published until the tool succeeds. If the operator denies, do not publish and ask how to proceed.
