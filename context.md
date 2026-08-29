# Context (source of truth)

This is the **only** document in the repo that knows this work is for a hackathon, names the event, quotes official rules, or talks about judges and tracks. Every other document (`docs/prd.md`, `docs/implementation-plan.md`, `docs/testing-plan.md`) **derives** product, engineering, and test requirements from this file. They must not restate event rules. If a derived doc conflicts with this file on compliance (secrets, TrueForge, public repo, Qodo PRs, AI disclosure), **this file wins**.

## Event

- **Name:** The Agent Harness Hackathon (WeMakeDevs × TrueFoundry)
- **Official pages:** [hackathon](https://www.wemakedevs.org/hackathons/trueforge) · [rules](https://www.wemakedevs.org/hackathons/trueforge/rules) · [resources](https://www.wemakedevs.org/hackathons/trueforge/resources) · [schedule](https://www.wemakedevs.org/hackathons/trueforge/schedule)
- **When:** 24–30 August 2026. Coding and design work must happen between **08:00 London on 24 August** and the deadline. Ideas, notes, architecture, and diagrams beforehand are allowed.
- **Deadline:** submissions close **30 August 2026, 20:00 London** (19:00 UTC).
- **Required runtime:** [TrueForge](https://github.com/truefoundry/trueforge) ([docs](https://trueforge.dev/introduction)). Open-source agent harness. Drive it via the bundled chat UI, HTTP API, or TypeScript SDK.
- **Build method:** a **coding agent** implements the repo from the derived docs. The human must still understand the agent, architecture, and decisions, and must verify the work. Projects that are entirely generated without meaningful contribution, verification, or understanding may be rejected. AI coding assistants are allowed and **must be disclosed**.

## What we are building

**InterviewOS** — an evidence-driven research desk on TrueForge. Given a company, role, job description, and resume, it investigates real interview expectations, writes a cited evidence ledger, compares that ledger to the candidate, and **publishes a preparation workspace only after a human approves**.

This is a specialized **research desk** (an official example job on the event page), differentiated by: evidence classes (official vs anecdote vs inferred), candidate gap analysis tied to citations, and an approval-gated publish. It is **not** a chat-only interview coach and **not** a multi-agent swarm the repo orchestrates itself.

## Official rules (copied from the event)

Registering means agreeing to these and the WeMakeDevs Code of Conduct.

1. You can take part online from anywhere in the world, and it costs nothing to enter. If you're in San Francisco on August 29, you can also spend the day building in the room.*
2. You can participate solo or in a team of up to 4 members. Each participant may only be part of one team.
3. Required technology: your agent must run on TrueForge, the open-source agent harness. A judge has to be able to see the harness doing real work rather than sitting under a thin wrapper around a model call.
4. Beyond that the challenge is open-ended. Build a developer tool, an internal assistant, a research desk, an incident responder, a data pipeline, or anything else worth handing to an agent, in any domain you like.
5. Your submission must be open source. Judges have to be able to read the code and run it.
6. Anything your agent touches has to be yours to touch. Connect tools, data, and accounts you own or have permission to use, and keep private, personal, and login-protected information out of your repo and your demo.
7. The project has to be built during the hackathon. You may discuss ideas, take notes, plan the architecture, or prepare diagrams beforehand, but the coding and design work itself has to happen between the 8:00 AM London start on August 24 and the deadline.
8. You may use frameworks, open-source libraries, public APIs, templates, third-party tools, and publicly available assets. The original work completed during the hackathon is what gets judged.
9. Every submission must include:
    - A public source-code repository
    - A clear README with setup steps
    - A demo video of about three minutes showing the agent working
    - A short write-up of what the agent does and how it uses TrueForge
    - A link to your blog post, if you're entering that prize
10. Submissions close on August 30 at 8:00 PM London time, and the schedule page shows that deadline in your own timezone.
11. AI coding assistants are allowed, but their use must be disclosed.
12. Participants must understand the submitted code and be able to explain the agent, the project architecture, and the technical decisions behind it.
13. Projects that are entirely generated using AI without meaningful participant contribution, verification, or technical understanding may be rejected.
14. There are three judged tracks: Best Use of TrueForge, Best Code Quality, and Best UI. Every submission is considered for all three, but one team can only take one of them. Best Use of TrueForge and Best Code Quality award one prize to the winning team; Best UI awards an iPad to every member of the winning team.**
15. The blog post prize goes to one writer: publish your write-up anywhere you like and add the link to your submission. Swag goes to ten participants who share their build publicly and tag WeMakeDevs and TrueFoundry.
16. Separately from the tracks, TrueFoundry offers a job interview to the teams behind the top projects. There is nothing to apply for: the judges pass those names on once the results are in. Winning a track is neither a condition of being on that list nor a guarantee of a place on it.
17. Any intellectual property developed during the hackathon belongs to the participant or team that created it. Teams are encouraged to agree internally on ownership before submitting.
18. Treat participants, organisers, sponsors, speakers, judges, and community members with respect.
19. Harassment, discrimination, plagiarism, or attempts to manipulate the judging process will result in disqualification.
20. Failure to follow these rules or the WeMakeDevs Code of Conduct may result in disqualification.

\*The live day has limited space and takes a registration of its own on Luma. Everyone who turns up gets $50 in OpenAI credits; online participants bring their own model API key.

\*\*Running your pull requests through Qodo is required to win the Best Code Quality track. Nothing else in the hackathon depends on it.

## Judging (equal weight)

From the official page. The demo is scored as hard as the code.

1. **Potential impact** — Does the agent do a clear, useful job someone would actually hand over?
2. **Creativity and originality** — Inventive job, or inventive way of doing it?
3. **Technical excellence** — Complete, reliable, well structured?
4. **Use of sponsor tools** — Is TrueForge **central** rather than a thin wrapper around a model, and did **Qodo review the pull requests** on the way there?
5. **Control and safety** — Does the agent run its code somewhere safe and stop for a human before anything irreversible?
6. **Presentation** — Does the demo explain the problem, the agent working, and where the harness fits?

## Qualification bar (disqualifies wrappers)

Stated on the official page as the rule that decides whether a project qualifies:

> A judge has to see TrueForge reaching a tool, running code in the sandbox, and stopping for a person. If it would work just as well as a chat box, change the project.

Also: “Pick one job an agent can finish.” One narrow job done end to end scores better than a platform with three half-finished features.

## Tracks this project targets

Every submission is considered for all three tracks; a team can win only one. This project is built to be a **winning** submission on **Best Code Quality** (Qodo / Mac Mini) **and** a serious contender on **Best Use of TrueForge**. UI uses the **bundled TrueForge chat** (not a custom app) so quality of the harness wiring and the PR trail stay first.

### Best Code Quality (required process, not optional)

Official copy:

> For the team that treats a hackathon repo like real software. Install Qodo on the repo on day one, work through pull requests, let it review each one, and deal with what it finds before you merge. Judges read the review trail, so ship something a stranger could clone, understand, and extend. Using Qodo is required to win this track.

Implications that **derived docs must enforce as engineering process** (without naming the track):

- Create the GitHub repo and **install the Qodo GitHub App before the first feature PR**.
- **No feature work merged by pushing to `main`.** Branch → PR → Qodo review → address findings → then merge.
- On each PR, Qodo must actually run. If it does not auto-comment, post `/agentic_describe` and `/agentic_review` ([Qodo review](https://docs.qodo.ai/code-review/use-qodo-in-prs/code-review)).
- **Deal with findings before merge:** fix Action Required items, or dismiss on the PR with `@qodo` and a reason (Rejected / Intentional / Deferred) so the trail shows a human decision ([chat with Qodo](https://docs.qodo.ai/code-review/chat-with-qodo-in-your-pull-requests)).
- Keep PRs small and reviewable. A stranger should be able to clone, understand, and extend.
- Do not open a single PR an hour before the deadline. The **history** is the evidence.
- Qodo is [free to install from GitHub Marketplace](https://github.com/marketplace/qodo-merge-pro). Sign-in: [app.qodo.ai](https://app.qodo.ai/signin). Event resources: [hackathon Qodo links](https://www.wemakedevs.org/hackathons/trueforge/resources).
- Commit `.pr_agent.toml` on the default branch so reviews run on later PRs.

### Best Use of TrueForge (product shape)

Official: real tools through MCP, generated code in a sandbox, pause for human approval before anything irreversible, work handed to subagents, a session that holds together across reconnects. The harness does the work; it does not sit under a thin wrapper.

TrueForge capabilities this project **must** make visible (see [docs](https://trueforge.dev/key-features/overview)):

| Capability | How InterviewOS uses it |
|---|---|
| MCP tools | Exa (search/fetch). Custom `interviewos` MCP for ingest + **write** publish. |
| Dynamic subagents | Root fans out role / loop / tech-DSA research (and optional skeptics). Do **not** register six specialist agents. |
| Sandbox | Daytona (only provider today). Skills, Code Mode ledger merge, file workspace, resume parse. |
| Human approval | Gate **`publish_workspace`** (MCP `@write`). Do not gate search. |
| Persistent session | One session = one investigation. Files persist across turns; reconnect + follow-up must work. |
| Skills | Three git-backed `SKILL.md` playbooks. Require sandbox. |
| Ask user questions | Clarify timeline/level before fan-out (subagents cannot ask). |
| Generative UI | Evidence scorecard in chat. |
| Bundled chat UI | Product UI. No custom chat app. |

Do **not** build a CrewAI/LangGraph swarm beside TrueForge. The harness already plans, spawns subagents, pauses, and persists.

### Best UI (do not optimize for)

Judged on demo + running project: show what the agent is doing, waiting on, and did; ask **before** the irreversible step. The bundled TrueForge UI already does this if we do not hide it. Do not spend the build on a custom frontend.

## Submission package (must exist at the end)

- Public GitHub repo judges can clone and run
- README with setup (TrueForge, model, Exa, Daytona, Qodo already on the repo, import skills, create agent, fixture prompt) **and** a `## Qodo Code Review Evidence` section: one representative merged PR with meaningful code, what Qodo surfaced and what changed or was dismissed, plus a PR history that shows the review, the team's decision, and a follow-up review against the final code
- ~3 minute demo video of the agent **working** (tools, sandbox, approval, workspace) — no secrets, no real personal resume
- Short write-up: what the agent does and **how it uses TrueForge**
- Optional: blog post link (separate prize); social posts tagging WeMakeDevs, TrueFoundry, Qodo

Disclose AI assistance in the README.

## Safety and data

- Only tools, data, and accounts we own or have permission to use.
- **No** private, personal, or login-protected information in the repo or the video. Fixtures are synthetic.
- API keys stay in TrueForge Settings / local env, never in git.
- Resume PDFs are untrusted input: parse in the sandbox, do not dump raw bytes into the root prompt.

## Architecture decision (locked)

Keep the product. **Do not** implement the original 6–7 named-agent pipeline.

- **1** saved TrueForge agent (`interviewos`)
- **3** skills: `interviewos-research`, `interviewos-ledger`, `interviewos-workspace`
- Dynamic subagents at runtime (not extra agent specs)
- Evidence ledger `evidence.jsonl` as source of truth (no vector DB)
- Four published artifacts: `evidence.jsonl`, `brief.md`, `gaps.md`, `plan.md`
- Custom MCP write tool `publish_workspace` so approval is a real harness pause (sandbox file writes alone may not trigger MCP approval)
- Golden path fixture: public company + engineering IC role (e.g. Google SRE) + **synthetic** resume

## Derived documents

| File | What it is allowed to know |
|---|---|
| [docs/prd.md](docs/prd.md) | Product: job, requirements, architecture, non-goals, quality bar. No event/rules/judges. |
| [docs/implementation-plan.md](docs/implementation-plan.md) | How a coding agent builds it: phases, files, Qodo/Git protocol, commits. No event copy. |
| [docs/testing-plan.md](docs/testing-plan.md) | How to verify after build. No event copy. |

## Official TrueForge references for implementers

- [Quickstart](https://trueforge.dev/quickstart) — local: `npx @truefoundry/trueforge@latest` (Node 22.14+), UI `http://localhost:8790`
- [Create an agent](https://trueforge.dev/create-agent/overview) — spec, approvals, skills, subagents
- [Subagents](https://trueforge.dev/key-features/subagents) — one-level, parallel, cannot ask the user
- [Skills](https://trueforge.dev/skills) — git `SKILL.md`, require sandbox
- [Sandbox](https://trueforge.dev/sandbox) — Daytona only; sandbox-as-tool; session reuse
- [Code Mode](https://trueforge.dev/key-features/code-mode) — Python in sandbox; MCP bridged through harness
- [MCP servers](https://trueforge.dev/mcp-servers) — Exa is in the shipped catalog, no auth
- Cookbook examples (PR, may still be draft): [truefoundry/trueforge#390](https://github.com/truefoundry/trueforge/pull/390) — especially **claim-red-teamer** (no SUPPORTED without a URL)
