# InterviewOS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Read [`../context.md`](../context.md) then [`prd.md`](prd.md) before writing code. If those documents conflict with this plan on product behavior, the PRD wins. If they conflict on compliance (secrets, TrueForge as runtime, public repo, Qodo-on-every-PR, no personal data), `context.md` wins. Do not copy event rules into code comments or README beyond what the PRD already requires (TrueForge setup, AI disclosure, no secrets).

**Goal:** Ship InterviewOS as specified in the PRD: one TrueForge agent, three skills, Exa + custom MCP, evidence ledger, approval-gated publish, tests, and a stranger-runnable README.

**Architecture:** TrueForge runs the loop. This repo supplies `agent.json`, skills, a small HTTP MCP, a ledger checker, synthetic fixtures, and tests. No custom agent runtime. No custom chat UI.

**Tech stack:** TrueForge (local `npx`); Node.js 22.14+ (MCP + MCP tests); Python 3.12+ stdlib (`scripts/check_ledger.py` + tests); Exa MCP (catalog); Daytona sandbox; GitHub + Qodo.

## Global constraints

- Never commit API keys, `.env`, personal resumes, or live session data.
- Fixtures are synthetic only.
- Do not add a vector DB, LangGraph/CrewAI orchestration, or a custom web app.
- Do not register multiple TrueForge agents for Role/Interview/DSA/etc.
- Do not push product commits to `main`. Follow **Git and Qodo protocol** on every phase.
- Do not use `git commit --no-verify` or skip hooks unless the human explicitly overrides.
- Do not add Cursor / `cursoragent` / `*@cursor.com` co-author trailers.
- Disclose AI assistance in README when you write it (PRD requirement).
- Sandbox provider is Daytona; skills require sandbox enabled on the agent.
- `publish_workspace` is the only tool that must require approval.

---

## Target repo layout

```
.
├── AGENTS.md
├── README.md
├── LICENSE
├── .gitignore
├── .pr_agent.toml
├── agent.json
├── package.json
├── package-lock.json
├── context.md
├── docs/
│   ├── prd.md
│   ├── implementation-plan.md
│   ├── testing-plan.md
│   └── writeup.md
├── skills/
│   ├── interviewos-research/SKILL.md
│   ├── interviewos-ledger/SKILL.md
│   └── interviewos-workspace/SKILL.md
├── mcp/
│   ├── server.mjs
│   ├── ingest.mjs
│   └── publish.mjs
├── scripts/
│   └── check_ledger.py
├── fixtures/
│   ├── google-sre.jd.txt
│   ├── candidate.synthetic.md
│   └── golden-prompt.md
├── tests/
│   ├── check_ledger.test.py
│   ├── ingest.test.mjs
│   └── publish.test.mjs
└── examples/
    └── workspace-sample/          # committed synthetic output only, no live URLs that leak PII
```

---

## Git and Qodo protocol (mandatory)

This is how every phase ships. Skipping it is a failed implementation.

### Bootstrap (once, Phase 0)

1. `git init` if needed. First commit on `main` may contain **only** docs already in the tree (`context.md`, `docs/*`) plus `.gitignore` — no feature code.
2. Create a **public** GitHub repo. Push `main`.
3. Install **Qodo** on that repo: [GitHub Marketplace — Qodo](https://github.com/marketplace/qodo-merge-pro) and/or [app.qodo.ai/signin](https://app.qodo.ai/signin) → Integrations → GitHub. Confirm the app is listed on the repo.
4. Protect `main` if the human can: require PRs. If they cannot, the coding agent still **never** pushes feature work to `main`.
5. Phase 0 PR adds `.pr_agent.toml` so later PRs auto-review.

`.pr_agent.toml` (GitHub only — do not include other provider tables):

```toml
[github_app]
pr_commands = [
    "/agentic_describe",
    "/agentic_review"
]

[review_agent]
comments_location_policy = "both"
inline_comments_severity_threshold = 3
issues_user_guidelines = "Prefer correctness, security, and missing tests. Do not suggest vector databases, extra agent frameworks, or a custom chat UI. Flag committed secrets, personal data, and approval bypasses on write tools."
```

### Every later phase

1. `git checkout main && git pull`
2. `git checkout -b phase-N-short-slug`
3. Implement **only that phase**. Keep the diff reviewable.
4. Run that phase’s tests locally until green.
5. Commit with a conventional message (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). One logical commit is fine; split if the diff is large.
6. `git push -u origin HEAD`
7. Open a PR **into `main`** with a body that states: what changed, how to test, any operator setup (TrueForge/Daytona) if relevant.

```bash
gh pr create --title "phase N: <slug>" --body "$(cat <<'EOF'
## Summary
- <bullets>

## Test plan
- [ ] <commands from this phase>
- [ ] Qodo review posted and Action Required items resolved or dismissed

EOF
)"
```

8. **Wait for Qodo.** If nothing appears within a couple of minutes, comment on the PR:

```text
/agentic_describe
/agentic_review
```

9. **Deal with findings before merge:**
   - **Action Required:** fix in the branch, push, re-review (Qodo should update; if not, `/agentic_review` again).
   - False positive: comment `@qodo This is rejected because <reason>.`
   - Out of scope: `@qodo Deferred; follow-up PR.`
   - Intended behavior: `@qodo Intentional: <why>.`
   - Refresh GitHub if the bot is silent ([Qodo chat notes](https://docs.qodo.ai/code-review/chat-with-qodo-in-your-pull-requests)).
10. Merge only when tests are green and Action Required is empty (fixed or dismissed on the record). Prefer merge commit or squash **keeping the PR** (the PR thread is the review trail).
11. Do not delete the PR discussion. Do not force-push `main`.

### Human gates (stop and ask)

Stop and ask the human if: Qodo is not installed; GitHub auth fails; Daytona/Exa/model keys are missing for a live phase; a TrueForge API has changed vs this plan; you are about to commit anything that looks like a secret.

---

### Task 0: Phase 0 — repo hygiene and Qodo

**Files:**
- Create: `.gitignore`, `LICENSE` (MIT), `AGENTS.md`, `.pr_agent.toml`
- Modify: none required besides existing docs
- Test: none (process)

**Interfaces:** none

- [ ] **Step 1:** Write `.gitignore` ignoring `node_modules/`, `.env`, `.env.*`, `*.pem`, `.trueforge/`, `dist/`, `__pycache__/`, `.venv/`, personal `fixtures/local/`.
- [ ] **Step 2:** Write `AGENTS.md`:

```markdown
# InterviewOS

Read `context.md`, then `docs/prd.md`, then this plan: `docs/implementation-plan.md`.
Verify with `docs/testing-plan.md`.

Runtime is TrueForge. Do not implement an agent loop.
Git: never push features to main. Qodo must review every PR. See implementation plan protocol.
```

- [ ] **Step 3:** Add `.pr_agent.toml` as specified above. MIT LICENSE with the human’s name left as `Copyright (c) 2026 InterviewOS contributors` unless they specify otherwise.
- [ ] **Step 4:** Commit on a branch `phase-0-bootstrap`, open PR, run Qodo protocol, merge.

---

### Task 1: Phase 1 — ledger checker (TDD)

**Files:**
- Create: `scripts/check_ledger.py`, `tests/check_ledger.test.py`
- Test: `python3 tests/check_ledger.test.py`

**Interfaces:**
- Produces: CLI `python3 scripts/check_ledger.py <workspace_dir>` exit `0` if valid, `1` if not. Prints violation lines to stderr.
- Validates: `evidence.jsonl` schema fields; unique `id`; `supported` ⇒ non-empty `source_url` starting with `http`; markdown files `brief.md` `gaps.md` `plan.md` if present: every `[^E\d+]` exists in the ledger; no `supported` class `inferred`.

- [ ] **Step 1: Write failing tests** in `tests/check_ledger.test.py` covering: valid workspace; missing citation; supported without URL; duplicate ids. Use `tempfile.TemporaryDirectory`. Import via `importlib` from `scripts/check_ledger.py` or subprocess the CLI — pick **CLI subprocess** so the sandbox can run the same entrypoint.
- [ ] **Step 2: Run tests — expect FAIL** (`file not found` or import error).
- [ ] **Step 3: Implement `scripts/check_ledger.py`** stdlib only (`json`, `re`, `sys`, `pathlib`). No pip deps.
- [ ] **Step 4: Run tests — expect PASS.**
- [ ] **Step 5: Branch PR + Qodo protocol.** Message: `feat: add evidence ledger checker`.

---

### Task 2: Phase 2 — MCP ingest + publish (TDD)

**Files:**
- Create: `package.json`, `mcp/ingest.mjs`, `mcp/publish.mjs`, `mcp/server.mjs`, `tests/ingest.test.mjs`, `tests/publish.test.mjs`
- Test: `npm test`

**Interfaces:**
- `ingestJd({ url?: string, text?: string })` → `{ title: string, company_guess: string, text: string, source: string }`
  - If `text` provided, `source` is `"pasted"`. If only `url`, fetch with `fetch`, extract visible text naively (strip tags), `source` is the URL. If neither, throw.
  - Do not follow redirects to link-local/metadata IPs (block `127.0.0.0/8`, `10.0.0.0/8`, `169.254.0.0/16`, `::1`). Pasted text is always allowed.
- `publishWorkspace({ workspaceDir: string, slug: string, confirm: boolean })` → `{ ok: true, slug, files: string[] }` or throws.
  - `confirm` must be `true`.
  - Runs `python3 scripts/check_ledger.py workspaceDir`; non-zero ⇒ throw with stderr.
  - Copies workspace to `mcp/.published/<slug>/` (gitignored except tests using tmp).
- MCP HTTP server (Streamable HTTP or the pattern TrueForge “Add MCP Server” accepts). Tools:
  - `ingest_jd` — read, maps to `ingestJd`
  - `publish_workspace` — **write** annotation (`destructiveHint` / whatever the SDK uses so TrueForge treats it as write). Maps to `publishWorkspace`. `workspaceDir` default `/opt/tfy/session/interviewos` **or** document the path the skill will use (`./interviewos/<slug>` in sandbox). Align skill + tool: publish reads from a path the agent writes in the sandbox. **Important:** MCP runs on the host, sandbox files are in Daytona. Publish cannot `fs.copy` sandbox files unless TrueForge mounts them.
  - **Correct publish model:** `publish_workspace` accepts `{ slug, files: [{ path, content }] }` (the agent reads sandbox files and passes contents), runs checker on a temp dir materialized from `files`, then returns `{ ok, slug, files: names }` and includes a markdown summary. Approval shows the tool args (the write). This avoids host/sandbox filesystem coupling.
  - Prefer **payload publish** (`files[]`) as specified here. Cap total payload (e.g. 1 MiB) and reject binary.
- `package.json` scripts: `"test": "node --test tests/*.test.mjs"`, `"start": "node mcp/server.mjs"`. MCP port `8788`. No extra frameworks if `@modelcontextprotocol/sdk` suffices; add it. Do not add Express unless the SDK requires an HTTP listener — then use Node `http`.

- [ ] **Step 1: Failing tests** for `ingestJd` (pasted text; SSRF blocked URL) and `publishWorkspace` (rejects `confirm: false`; rejects broken citations; accepts valid four-file payload).
- [ ] **Step 2: Run `npm test` — FAIL.**
- [ ] **Step 3: Minimal implementation.**
- [ ] **Step 4: `npm test` — PASS.**
- [ ] **Step 5: PR + Qodo.** Message: `feat: add interviewos MCP ingest and publish tools`.

---

### Task 3: Phase 3 — skills and agent spec

**Files:**
- Create: `skills/interviewos-research/SKILL.md`, `skills/interviewos-ledger/SKILL.md`, `skills/interviewos-workspace/SKILL.md`, `agent.json`
- Test: checklist in PR (YAML frontmatter `name` + `description`; names match PRD)

**Interfaces:**
- Skill `name` frontmatter must equal directory contract: `interviewos-research`, `interviewos-ledger`, `interviewos-workspace`.
- `agent.json` keys per TrueForge agent spec (`snake_case`): `model.name` placeholder `REPLACE_WITH_YOUR_MODEL`; `instructions` short; `mcp_servers` Exa + `interviewos`; `skills` the three names; `config.sandbox.enabled: true`; `dynamic_sub_agents.enabled: true`; `generative_ui.enabled: true`; `ask_user_questions.enabled: true`; `interviewos.require_approval_for_tools` includes `publish_workspace` (and `@write` if supported).

Root instructions (use this text, tweak only if TrueForge token limits bite):

```text
You are InterviewOS. You investigate a target engineering role and optional resume, write a cited evidence ledger, and publish a preparation workspace only via the publish_workspace tool. Never claim a process or requirement is fact without a ledger row. Never mark supported without a retrieved URL. Load interviewos-research, interviewos-ledger, and interviewos-workspace when relevant. Ask clarifying questions for level and timeline before you fan out. Use subagents for parallel research. After drafting files, call publish_workspace and wait. Do not tell the user the workspace is published until that tool succeeds.
```

Each SKILL.md body must include the PRD rules for that slice (source classes; JSONL schema; file names; checker; publish payload). Research skill: official sources first; anecdotes tagged. Workspace skill: exact publish tool arguments.

- [ ] **Step 1: Write the three skills** (complete playbooks, not stubs).
- [ ] **Step 2: Write `agent.json`.**
- [ ] **Step 3: Grep that no second agent spec exists.**
- [ ] **Step 4: PR + Qodo.** Message: `feat: add InterviewOS skills and agent spec`.

---

### Task 4: Phase 4 — fixtures and README

**Files:**
- Create: `fixtures/google-sre.jd.txt`, `fixtures/candidate.synthetic.md`, `fixtures/golden-prompt.md`, `README.md`
- Modify: `AGENTS.md` if setup commands changed
- Test: README commands listed actually exist (`npm test`, `python3 tests/check_ledger.test.py`, `npm start`)

**Interfaces:**
- Golden prompt tells the agent: company Google, role Site Reliability Engineer, JD = contents of the fixture (paste), resume = synthetic fixture, 4-week horizon, L4-ish IC. Instruct it to use tools and publish.
- README sections: What it is; Architecture (one agent, skills, MCP, ledger); Prerequisites (Node 22.14+, Python 3, TrueForge, model key, Exa connector, Daytona key); Install Qodo is already on the repo (do not tell people to skip PRs); Configure TrueForge; Register this repo as a skill source (GitHub URL + paths); Add custom MCP URL `http://localhost:8788/mcp` (adjust to actual path); Create agent from `agent.json`; Run `npm start` for MCP; Golden-path prompt; Credentials; AI disclosure sentence; License.

- [ ] **Step 1: Synthetic JD + resume** (no real names/emails/phones).
- [ ] **Step 2: README** complete enough that a stranger does not need this plan.
- [ ] **Step 3: PR + Qodo.** Message: `docs: add setup README and golden-path fixtures`.

---

### Task 5: Phase 5 — live vertical slice (research + brief + publish)

Operator/human must provide TrueForge running, model, Exa, Daytona. If missing, stop and ask.

**Files:**
- Modify: skills/agent.json only if the live run shows a concrete bug
- Create: `docs/writeup.md` draft after a successful run (what the agent does, how TrueForge is used: MCP, subagents, sandbox, approval, session)
- Test: execute [`testing-plan.md`](testing-plan.md) sections **Live A–C** (tools, sandbox, approval). Record notes in the PR (no secrets, no screenshots with keys).

- [ ] **Step 1: Register MCP, skills, agent. Run golden prompt.**
- [ ] **Step 2: Confirm Exa calls, subagents, sandbox file or Code Mode, `publish_workspace` pause, Allow, artifacts pass `check_ledger.py`.**
- [ ] **Step 3: Fix skill/agent/MCP gaps on a branch; tests stay green.**
- [ ] **Step 4: PR + Qodo.** Message: `fix: tighten InterviewOS prompt/tools from golden-path run`.

---

### Task 6: Phase 6 — gaps, plan, session follow-up

**Files:**
- Modify: `skills/interviewos-workspace/SKILL.md` (gap rubric: map resume bullets to evidence ids; P0 = official+supported and missing on resume; P1 = first_party/partial; P2 = anecdote or inferred)
- Test: Live D in testing plan (resume → `gaps.md`/`plan.md` citations); Live E (reconnect follow-up)

- [ ] **Step 1: Update skill with explicit gap rubric and examples.**
- [ ] **Step 2: Re-run golden path; verify gaps cite `[^E…]`.**
- [ ] **Step 3: In the same session, reconnect (or new turn) “deepen the system design round”; confirm it uses existing ledger.**
- [ ] **Step 4: PR + Qodo.**

---

### Task 7: Phase 7 — skeptic pass + generative UI

**Files:**
- Modify: `skills/interviewos-ledger/SKILL.md`, `agent.json` instructions (one paragraph: after merge, spawn skeptics for top 8 claims; render a Generative UI table of id/claim/verdict/class/url)
- Test: Live F (scorecard visible in chat; at least one claim not blindly supported)

- [ ] **Step 1: Skill + instruction update.**
- [ ] **Step 2: Live run; fix only if skeptics skip Exa or mark supported without URLs.**
- [ ] **Step 3: PR + Qodo.**

---

### Task 8: Phase 8 — sample workspace + write-up polish

**Files:**
- Create: `examples/workspace-sample/` with **synthetic** ledger+md that pass `check_ledger.py` (can be from a redacted live run: strip real resume, keep public URLs)
- Modify: `docs/writeup.md`, README link to write-up
- Test: `python3 scripts/check_ledger.py examples/workspace-sample`

- [ ] **Step 1: Sample workspace + checker green.**
- [ ] **Step 2: Write-up: problem, flow, where TrueForge is the loop (MCP, sandbox, approval, subagents, session).**
- [ ] **Step 3: PR + Qodo.**

---

### Task 9: Phase 9 — full testing plan + defects

- [ ] **Step 1: Execute all of [`docs/testing-plan.md`](testing-plan.md).**
- [ ] **Step 2: File fixes as additional PRs (still Qodo). Do not batch unrelated fixes.**
- [ ] **Step 3: Confirm `main` history is multiple merged PRs with Qodo comments, not one dump.**

---

## Out of scope unless a later PRD change

GitHub/DeepWiki MCP, PDF resume parsing libraries, custom TrueForge UI embed, Notion export, second company golden path.

## Execution

Implement **Phase 0 first**. Do not start Phase 1 until Qodo has reviewed the bootstrap PR. Then proceed in order. After all phases, run the testing plan end to end and only then consider the build complete.
