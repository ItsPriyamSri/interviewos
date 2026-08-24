# InterviewOS PRD

Derived from [`context.md`](../context.md). This document specifies the product. It does not describe an event, judges, or tracks.

## Job

InterviewOS investigates a target engineering role and a candidate profile, then publishes a **cited preparation workspace** only after a human approves the publish.

One-line: *Given a company, role, job description, and resume, produce a sourced interview brief, a gap analysis, and a P0/P1/P2 plan — and do not publish until the operator allows it.*

## Problem

Job descriptions and internet interview lore disagree. Chat models flatten rumor, official guides, and guesses into one confident answer. A candidate needs a **workspace they can study from**, with every factual claim tied to a retrieved source or explicitly marked inferred — and a chance to refuse publication if the evidence is junk.

## Users

- **Operator:** the person running TrueForge locally, pasting/linking a JD, providing a synthetic or their own resume **only in the running session** (never committed if personal).
- **Downstream reader:** the same person studying `brief.md` / `gaps.md` / `plan.md` after publish.

## Runtime and UI (non-negotiable)

- The agent **runs on TrueForge**. The repo does not implement its own agent loop, tool router, approval UI, or session store.
- Product UI is the **bundled TrueForge chat**. Do not build a custom chat application. Generative UI **inside** that chat is in scope.
- Long procedures live in **skills**, not extra saved agents. Research fan-out uses TrueForge **dynamic subagents**.
- Irreversible action is **publishing the workspace**, implemented as an MCP tool annotated write/destructive so TrueForge pauses for Allow/Deny.
- Sandbox is **on** (required for skills, Code Mode, files). Provider: Daytona.
- Sessions persist: one investigation can reconnect and continue; sandbox files from earlier turns remain.

## Inputs

Required:

- Company name
- Role title
- Job description: public URL and/or pasted text

Optional (ask via TrueForge clarifying questions if missing and it would change research):

- Target level (e.g. L4 / L5 / IC3)
- Prep horizon (e.g. 2 weeks / 6 weeks)
- Location or office constraint
- Resume: pasted text (must-have path) or PDF uploaded/available to the sandbox (should-have path)

If the operator refuses to provide a resume, still produce `brief.md` from research; skip `gaps.md` / `plan.md` or mark them N/A — do not invent a candidate.

## Outputs (published workspace)

After approval, a downloadable directory:

```
interviewos/<slug>/
  evidence.jsonl    # source of truth
  brief.md          # role + interview loop + tech/DSA, cited
  gaps.md           # candidate vs ledger (omit or N/A without resume)
  plan.md           # P0/P1/P2 only from cited gaps
```

`<slug>` is a filesystem-safe `{company}-{role}` (lowercase, hyphens).

Do not emit a pile of extra markdown (no separate role-analysis / interview-process / dsa-expectations / sources.md). Quality of four files beats eight thin files.

### `evidence.jsonl`

One JSON object per line. Schema:

```json
{
  "id": "E001",
  "claim": "string, atomic, checkable",
  "topic": "role | loop | tech | dsa",
  "source_url": "string or empty if inferred",
  "source_title": "string",
  "retrieved_at": "ISO-8601",
  "class": "official | first_party | second_party | anecdote | inferred",
  "quote": "short span actually retrieved, empty if inferred",
  "verdict": "supported | partial | unsupported | contradicted",
  "notes": "string"
}
```

Rules:

- `verdict` of `supported` requires a real `source_url` the tools retrieved. Prior knowledge is `inferred`, never `supported`.
- `class`:
  - `official` — careers page, JD, company eng blog, official interview guide
  - `first_party` — company employees writing in official or clearly affiliated channels
  - `second_party` — reputable reporting, well-known prep sites citing a source
  - `anecdote` — Blind, Reddit, Glassdoor, random YouTube
  - `inferred` — model extrapolation, no URL
- Contradictions are **two rows**, not an average.
- IDs are unique per workspace, stable for the session (`E001`…).

### Markdown files

- Every factual sentence in `brief.md`, `gaps.md`, and `plan.md` cites `[^E00x]` or is tagged `[INFERRED]`.
- Anecdotes may appear but must stay tagged; they must not be phrased as “the company’s process is X” unless `official` or `first_party` supports it.
- `plan.md` P0/P1/P2 items must point at gap rows that point at evidence ids. No unsourced “study Kubernetes.”

## Agent design

### One saved agent

Name: `interviewos`.

Root does: clarify → ingest JD/resume → spawn research subagents → merge ledger (Code Mode) → optional skeptic subagents on top claims → draft files in sandbox → call `publish_workspace` and stop → after Allow, gaps + plan if resume exists.

Do **not** ship separate saved agents for Role / Interview / DSA / Evidence / Gap / Prep / Planner.

### Subagents (runtime only)

Typical first wave (parallel):

1. Role: responsibilities, skills, stack, seniority from official sources first
2. Loop: stages (recruiter, OA, coding, design, behavioral, role-specific)
3. Tech/DSA: topics with importance only when evidenced; otherwise inferred

Optional second wave: one skeptic subagent per top-N claims; a skeptic must not return `supported` without a URL (claim-red-team pattern).

Subagents share MCP tools and sandbox. They cannot ask the user questions. They cannot spawn nested subagents.

### Skills (git-backed in this repo)

| Skill | Responsibility |
|---|---|
| `interviewos-research` | Query recipes, source priority, when to stop |
| `interviewos-ledger` | JSONL schema, classes, citation and contradiction rules |
| `interviewos-workspace` | File layout, gap rubric, P0/P1/P2, when to call publish |

Root `instructions` stay short (role, never invent a stage, never publish without the write tool, load skills). Playbooks go in skills.

### MCP

**Exa** (catalog connector): web search and page fetch. Read-only; do not require approval.

**Custom `interviewos` server** (this repo):

| Tool | Side effect | Approval |
|---|---|---|
| `ingest_jd` | Normalize URL or text into `{ title, company_guess, text, source }` | No |
| `publish_workspace` | Snapshot/export sandbox workspace for download; annotated **write** | **Yes** |

Resume: prefer sandbox parse of text/PDF. If a resume tool is added, it is read-only.

`publish_workspace` arguments: `{ "slug": string, "confirm": true, "files": [{ "path": string, "content": string }] }` — the agent reads the drafted sandbox files and passes their contents; the tool runs `scripts/check_ledger.py` on a temp dir materialized from `files` and fails if it would fail. Payload caps at 1 MiB; binary content rejected.

## Evidence strategy (no vector database)

Corpus per run is small (tens of pages). Retrieval is Exa + fetch. Integrity is the ledger plus `scripts/check_ledger.py` (every markdown citation exists; every `supported` row has a URL). That is the anti-hallucination system.

## Control and safety

- Search and research run without pausing.
- Sandbox executes untrusted resume content and generated merge scripts. Model/MCP credentials never go into the sandbox (TrueForge default).
- **Publish** pauses. Deny means no published workspace.
- Fixtures in git are synthetic. No personal resumes, no API keys, no `.env` committed.

## Quality bar (engineering)

- Public repo a stranger can clone, configure, and run from the README.
- All product code lands through **GitHub pull requests**. **Qodo** reviews each PR; Action Required findings are fixed or dismissed on the PR with a recorded reason before merge. Do not push feature commits to `main`.
- Automated tests for ledger checking and MCP tool contracts (see `docs/testing-plan.md`).
- AI assistance disclosed in the README.
- README includes: TrueForge, model, Exa, Daytona, skill import, agent create, fixture prompt, where credentials live.

## Success criteria

The product is done when:

1. Operator can run the golden-path fixture through TrueForge chat and see Exa tool calls, subagents, sandbox work, and a publish approval pause.
2. After Allow, the four artifacts download and pass `check_ledger.py`.
3. Reconnect to the same session and a follow-up (“deepen system design”) reuses context/files.
4. Gaps/plan cite ledger ids; inferred claims are visible.
5. README works on a clean machine (documented third-party accounts excepted).
6. Git history is a sequence of reviewed PRs, not a dump onto `main`.

## Non-goals

- Named multi-agent orchestration frameworks beside TrueForge
- Vector DB / custom long-term memory
- Job-board scraping, LinkedIn/Indeed as a core feature, autonomous applications
- Full LMS, mock interviewer product, gamification, flashcards
- Custom chat UI / web app
- TrueFoundry AI Gateway or MCP Gateway
- “Any job on earth” polish; the supported vertical is **software engineering IC** (SWE/SRE). Other roles may run but are not the quality bar.

## Open decisions (defaults)

- **UI:** bundled TrueForge chat (locked).
- **Resume PDF:** should-have; pasted text is the must-have path.
- **Skeptic wave:** should-have after the golden path works.
- **GitHub MCP / DeepWiki:** stretch; not required for done.
