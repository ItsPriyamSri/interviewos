# InterviewOS testing plan

Derived from [`prd.md`](prd.md). Run this **after** implementation (and again after any fix PR). Do not treat a single golden-path chat as enough.

Prerequisites: `npm test` and `python3 tests/check_ledger.test.py` exist; TrueForge local; model; Exa connected; Daytona configured; `npm start` MCP reachable; skills attached; agent created from `agent.json`; Qodo installed on the GitHub repo.

Record results in a scratch note **outside git** if they contain session IDs. Commit only pass/fail tables with no secrets.

## 1. Automated (must pass on a clean clone)

```bash
python3 tests/check_ledger.test.py
npm test
python3 scripts/check_ledger.py examples/workspace-sample
```

Expect: all exit 0.

Extra cases to have in those tests (if missing, file a fix PR):

- `supported` row without `http` URL fails
- Markdown `[^E999]` with no row fails
- Duplicate `id` fails
- `ingestJd` pasted text returns `source: "pasted"`
- `ingestJd` to `http://127.0.0.1/` (or `169.254.169.254`) throws
- `publish_workspace` with `confirm: false` throws
- `publish_workspace` with broken citations throws
- Valid payload returns `ok: true`

## 2. Repo hygiene

- `git grep -E 'sk-|api_key|BEGIN PRIVATE|AKIA'` on the default branch finds nothing real (allow docs saying `YOUR_*` placeholders).
- `fixtures/` has no real email, phone, or government ID.
- README lists setup without requiring copying secrets into the repo.
- `AGENTS.md` points at PRD + implementation plan.
- No second TrueForge agent spec besides `agent.json`.
- `.pr_agent.toml` exists on `main`.

## 3. Git / Qodo trail

On GitHub:

- More than one merged PR into `main`.
- Each feature PR has a Qodo review (`/agentic_review` output or auto review).
- No open Action Required on merged PRs without a dismissal comment (`@qodo` Rejected / Intentional / Deferred) or a follow-up commit that cleared it.
- `main` was not used as the working branch for features.
- README has `## Qodo Code Review Evidence` with a representative merged PR, what Qodo found and what changed, and a PR history that includes a follow-up review.

If Qodo never commented on a merged PR, that PR fails this section — open an empty follow-up only if needed to document the gap; prefer not to rewrite history.

## 4. Live harness (TrueForge chat, golden prompt)

Use `fixtures/golden-prompt.md` with pasted `fixtures/google-sre.jd.txt` and `fixtures/candidate.synthetic.md`. New session bound to `interviewos`.

### A. Tool use (not a wrapper)

Pass if the transcript shows **Exa** (or listed search MCP) tool calls with real queries, not a one-shot model essay with fake URLs.

Fail if the brief is produced with zero MCP calls.

### B. Subagents

Pass if the root calls `create_sub_agent` (or equivalent TrueForge subagent tool) at least twice in parallel for distinct briefs (role vs loop vs tech).

Fail if a single agent sequentially dumps everything with no delegation on a full golden prompt.

### C. Sandbox

Pass if a sandbox is provisioned and used: skill read, Code Mode, file write, or `check_ledger.py`. TrueForge UI/logs show sandbox activity.

Fail if sandbox is disabled on the agent or never used on the golden path.

### D. Approval (irreversible step)

Pass if `publish_workspace` **pauses** for Allow/Deny **before** the agent claims the workspace is published. Click **Deny** once on a throwaway session: no successful publish. New session: **Allow** and files/payload succeed.

Fail if publish runs with no pause, or if search tools are the only things gated.

### E. Artifacts

After Allow, save/download the four files. Run:

```bash
python3 scripts/check_ledger.py /path/to/workspace
```

Pass if exit 0; `brief.md` has `[^E` citations; `gaps.md` and `plan.md` exist and cite ids; inferred lines tagged `[INFERRED]` or class `inferred` in JSONL.

Fail if DSA/tech lists have no citations and no inferred tags.

### F. Gaps tied to evidence

Pass if at least one P0/P1 item in `plan.md` points at a gap that points at an evidence id whose `class` is `official` or `first_party` when claiming a company process.

Fail if the plan is generic “do leetcode” with no ids.

### G. Session persistence

Refresh the browser (or reconnect). Same session: ask to deepen one stage (e.g. system design). Pass if it reuses ledger/files and does not start from zero with a contradictory process.

### H. Clarifying questions

On a prompt missing level and timeline, pass if the agent asks via TrueForge questions **before** or at the start of fan-out, not after publish.

### I. Generative UI

Pass if a scorecard/table of claims and verdicts appears in chat on a full run (Phase 7+). If Phase 7 not merged, mark N/A.

### J. Resume-less path

New session, JD only, no resume. Pass if `brief.md` still publishes and gaps/plan are omitted or explicitly N/A — not a fabricated candidate.

## 5. Safety

- Deny path (4D) already.
- MCP SSRF tests already in section 1.
- Confirm model and Exa keys are not visible in sandbox logs pasted into the PR.
- Confirm the agent does not instruct the user to paste production secrets into chat.

## 6. Stranger clone (README)

On a machine or worktree with only git clone + documented env:

1. Follow README until chat opens with `interviewos`.
2. Run golden prompt once (operator keys allowed in TrueForge Settings, not in git).
3. Pass if a non-author can reach a publish pause without reading the implementation plan.

Fail if setup steps are missing (skill git URL, MCP port, sandbox, approval policy).

## 7. Done

The build is verified only if sections **1–6** pass (7I may be N/A). File one PR per defect cluster; re-run the failed section after merge.
