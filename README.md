# InterviewOS

An evidence-driven interview preparation desk that runs on
[TrueForge](https://trueforge.dev/introduction), the open-source agent harness.

Given a company, a role, a job description, and an optional resume, the
`interviewos` agent researches real interview expectations on the web, writes a
**cited evidence ledger**, compares it against your resume, and publishes a
preparation workspace (`evidence.jsonl`, `brief.md`, `gaps.md`, `plan.md`) —
**only after you approve the publish step**.

## How it works

```
            ┌────────────────────── TrueForge ──────────────────────┐
            │                                                        │
 you ──────▶│  chat UI          interviewos agent (agent.json)       │
            │                     │        │                         │
            │   clarifying Qs ◄───┘        ├── skills (this repo)    │
            │                              │    research / ledger /  │
            │                              │    workspace            │
            │                              ├── dynamic subagents     │
            │                              │    role · loop · dsa    │
            │                              ├── Exa MCP (search/fetch)│
            │                              ├── Daytona sandbox       │
            │                              │    (files + code mode)  │
            │                              └── interviewos MCP       │
            │                                   ingest_jd   (read)   │
            │                                   publish_workspace ► pause: Allow/Deny
            └────────────────────────────────────────────────────────┘
```

- **One saved agent** (`agent.json`). Research fan-out uses TrueForge *dynamic subagents* at runtime, not extra saved agents.
- **Three git-backed skills** provide the playbooks: `interviewos-research`, `interviewos-ledger`, `interviewos-workspace`.
- **Custom MCP server** (this repo) exposes two tools:
  - `ingest_jd` — normalizes a JD from pasted text or a public URL (SSRF-guarded).
  - `publish_workspace` — validates the four-file payload with
    `scripts/check_ledger.py` and materializes the downloadable workspace. It is
    annotated as a write/destructive tool, so TrueForge pauses for human approval.
- **Evidence ledger** is the anti-hallucination system: every factual claim in
  the published markdown cites a ledger row; unsupported claims must be tagged
  `[INFERRED]`. No vector database. Deeper dive: [docs/writeup.md](docs/writeup.md).

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 22.14 | for TrueForge and this repo's MCP server/tests |
| Python ≥ 3.12 | stdlib only; runs the ledger checker |
| [TrueForge](https://trueforge.dev/quickstart) locally | `npx @truefoundry/trueforge@latest`, UI at `http://localhost:8790` |
| A working model | TrueForge Settings → Models. The agent spec uses `REPLACE_WITH_YOUR_MODEL`; pick a provider/model your key can actually call (a 404 means the configured id is wrong or the key is missing). |
| Exa connector | ships in the TrueForge MCP catalog; enable it for the agent |
| [Daytona](https://www.daytona.io/) account/key | sandbox provider; set in TrueForge Settings |

## Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/ItsPriyamSri/interviewos.git
   cd interviewos
   npm install
   ```

2. **Run the tests** (optional but recommended)

   ```bash
   npm test                            # MCP tool contract tests
   python3 tests/check_ledger.test.py  # ledger checker tests
   ```

3. **Start the custom MCP server**

   ```bash
   npm start
   # → interviewos MCP listening on http://localhost:8788/mcp
   ```

4. **Register the MCP server in TrueForge**
   - Settings → MCP → Add Server → URL: `http://localhost:8788/mcp`
   - Enable the built-in **Exa** connector from the catalog as well.

5. **Import the skills from this repo**
   - In TrueForge, add a skill source pointing at this GitHub repository and
     import the three skills under `skills/`.

6. **Create the agent**
   - Create an agent from this repo's `agent.json`.
   - Replace `REPLACE_WITH_YOUR_MODEL` with a model id that already works in
     TrueForge chat (Settings → Models). Do not leave a placeholder or an
     unpublished/internal id — that surfaces as HTTP 404 on the first turn.
   - Confirm the agent has: sandbox enabled (Daytona), dynamic subagents
     enabled, ask-user questions enabled, and approval required for
     `publish_workspace`.

7. **Run the golden path**

   Open the TrueForge chat with the `interviewos` agent selected, then paste
   [`fixtures/golden-prompt.md`](fixtures/golden-prompt.md), replacing its two
   placeholders with the contents of
   [`fixtures/google-sre.jd.txt`](fixtures/google-sre.jd.txt) and
   [`fixtures/candidate.synthetic.md`](fixtures/candidate.synthetic.md).

   Expected behavior: clarifying questions (if needed) → Exa searches →
   parallel subagents → sandbox drafting → a **publish approval pause** →
   after **Allow**, four artifacts pass the ledger check and download.

## Where credentials live

Model keys, Exa, and Daytona credentials go in **TrueForge Settings** or your
local environment. Never commit `.env`, API keys, or personal resumes to this
repository. Everything in `fixtures/` is synthetic.

## Repository layout

```
agent.json                  # the one saved TrueForge agent spec
skills/                     # three SKILL.md playbooks
mcp/                        # custom MCP server (ingest_jd, publish_workspace)
scripts/check_ledger.py     # evidence ledger validator (stdlib Python)
tests/                      # Python + Node test suites
fixtures/                   # synthetic golden-path inputs
docs/                       # PRD, implementation plan, testing plan, write-up
examples/workspace-sample/  # committed sample output, passes the checker
```

## Qodo Code Review Evidence

Every substantive change goes through a GitHub pull request reviewed by
[Qodo](https://www.qodo.ai/) before merge. Direct pushes to `main` do not count
as reviewed work. The [Qodo GitHub App](https://github.com/marketplace/qodo-merge-pro)
is installed on this repository (see [`.pr_agent.toml`](.pr_agent.toml)). If a
review does not start on its own, comment `/agentic_review` on the PR.

**Representative PR:**
[#3 — interviewos MCP ingest and publish tools](https://github.com/ItsPriyamSri/interviewos/pull/3)

Qodo flagged a DNS/IP SSRF gap on `ingest_jd` (hostname-only checks), an
unbounded MCP request body, and `publish_workspace` leaving stale files on
republish. We fixed those (resolve and pin public IPs, 1 MiB body cap with
early close, wipe-then-write snapshot), pushed, and re-ran `/agentic_review`
against the final commits; Qodo marked the Action Required items resolved.

### PR history

| PR | Change | Review |
|---|---|---|
| [#1](https://github.com/ItsPriyamSri/interviewos/pull/1) | bootstrap, `.pr_agent.toml` | Qodo describe + review |
| [#2](https://github.com/ItsPriyamSri/interviewos/pull/2) | ledger checker | Qodo review, follow-up after fixes |
| [#3](https://github.com/ItsPriyamSri/interviewos/pull/3) | MCP ingest + publish | Qodo review → High findings fixed → follow-up review on final code |
| [#4](https://github.com/ItsPriyamSri/interviewos/pull/4) | skills + `agent.json` | Qodo review, follow-up |
| [#5](https://github.com/ItsPriyamSri/interviewos/pull/5) | README + fixtures | Qodo review, follow-up |
| [#6](https://github.com/ItsPriyamSri/interviewos/pull/6) | live agent spec | Qodo review, follow-up |
| [#7](https://github.com/ItsPriyamSri/interviewos/pull/7) | publish hardening | Qodo paused on the installing account; stand-in review posted on the thread |
| [#8](https://github.com/ItsPriyamSri/interviewos/pull/8) | sample workspace | Qodo paused, then posted after the app was re-linked; citation/claim bugs fixed in #9 |
| [#9](https://github.com/ItsPriyamSri/interviewos/pull/9) | follow-up on #8 | Qodo review (0 bugs) on the docs commit; High findings from #8 fixed and merged |

## AI disclosure

This project was built with the help of AI coding assistants (OpenCode), as
disclosed here per hackathon rules. All code was reviewed by a human, and
substantive pull requests are reviewed by [Qodo](https://www.qodo.ai/) — see
[Qodo Code Review Evidence](#qodo-code-review-evidence).

## License

[MIT](LICENSE)
