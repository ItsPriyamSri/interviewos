# InterviewOS write-up

## The job

Interview prep advice on the internet is a mix of official guides, recruiter
folklore, and outright guesses — presented with equal confidence. A candidate
who studies the blend has no way to know which claims trace back to the company
and which are forum noise.

InterviewOS is a research desk for one narrow job: investigate a target
software-engineering role, separate what is known from what is guessed, compare
it to a resume, and hand the candidate a **cited preparation workspace** — but
only after a human approves the publish.

## What the agent does

Given a company, role, job description (pasted text or URL), and an optional
resume:

1. **Clarifies** target level and prep horizon when they would change the
   research (TrueForge `ask_user_question`).
2. **Fans out** three parallel dynamic subagents — role, interview loop,
   tech/DSA expectations — each searching and fetching with **Exa**.
3. **Builds an evidence ledger**: every atomic claim becomes a row in
   `evidence.jsonl` with class (`official` / `first_party` / `second_party` /
   `anecdote` / `inferred`), a fetched quote, a URL, and a verdict. A supported
   verdict requires a retrieved URL; contradictions stay as two rows.
4. **Drafts four files** in the Daytona sandbox: `evidence.jsonl`, `brief.md`,
   `gaps.md`, `plan.md`. Every factual sentence cites `[^E###]` or is tagged
   `[INFERRED]`; plan items only come from cited gaps.5. **Stops at the gate**: publishing is an MCP tool call that TrueForge pauses
   for Allow/Deny. Deny ends it; Allow runs `scripts/check_ledger.py` over the
   payload — broken citations reject the publish.

## Where TrueForge is the product

The repo contains no agent loop. Everything below is harness capability this
project wires up:

| Harness feature | How InterviewOS uses it |
|---|---|
| MCP servers | Exa from the shipped catalog for search/fetch; a small custom HTTP MCP (`mcp/server.mjs`) exposing `ingest_jd` (read) and `publish_workspace` (write) |
| Tool approval | `publish_workspace` is annotated destructive and required by name in the agent spec, so the harness pauses before the irreversible step |
| Dynamic subagents | The root spawns parallel researchers per topic; results merge back through Code Mode |
| Sandbox (Daytona) | Skills load there, Python merges the ledger, drafts are written to files, untrusted JD/resume text never touches host credentials |
| Skills | Three git-backed playbooks (`interviewos-research`, `interviewos-ledger`, `interviewos-workspace`) carry the procedures so the root prompt stays short |
| Persistent sessions | One investigation = one session: reconnecting reuses the sandbox files and ledger for follow-ups like "deepen the system design round" |
| Generative UI | The evidence scorecard renders inline in chat |
| Ask clarifying questions | Level/timeline gaps surface before fan-out |

## The anti-hallucination system

No vector database. The corpus per run is tens of pages; integrity comes from
the ledger plus a stdlib Python checker:

- every markdown citation must resolve to a ledger row;
- every `supported` verdict needs an http(s) URL;
- `inferred` rows carry no URL and can never be `supported`;
- ids are unique and `E###`-shaped.

`publish_workspace` runs this checker server-side on the payload before writing
anything. In live runs it has rejected drafts with a malformed JSONL line and
cascading broken citations — the gate does real work.

## Live-run shape

A golden-path session shows: clarifying question → Exa searches with real
queries (`Google careers Site Reliability Engineer…`) → three subagent threads
in the same stream → sandbox file drafts under `interviewos/<slug>/` →
an approval pause showing the exact publish payload → on Allow, four artifacts
that pass the checker (~50 rows, 200+ inline citations on a Google SRE L4 run).

## Repo map

- `agent.json` — the single saved agent spec
- `skills/` — the three playbooks
- `mcp/` — custom MCP server + ingest/publish tools
- `scripts/check_ledger.py` — the validator used by the gate and by humans
- `tests/` — contract tests for both (Node) and the checker (Python)
- `fixtures/` — synthetic golden-path inputs
- `examples/workspace-sample/` — committed sample output that passes the checker
