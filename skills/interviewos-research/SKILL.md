---
name: interviewos-research
description: Query recipes, source priority, and stopping rules for researching a target engineering role's interview process. Load when gathering evidence about a company's role, interview loop, or tech/DSA expectations.
---

# InterviewOS Research

You research a target engineering role. Everything you report must become an
`evidence.jsonl` row (see the `interviewos-ledger` skill). Research is not done
when you feel confident — it is done when each topic has enough sourced rows or
explicit `[INFERRED]` rows.

## Fan-out (root agent)

Spawn parallel subagents with distinct briefs:

1. **Role** — responsibilities, skills, stack, seniority signals
2. **Loop** — stages: recruiter screen, OA, coding rounds, system/reliability design, behavioral, role-specific rounds
3. **Tech/DSA** — topics and depth expectations

Subagents share MCP tools and the sandbox. They cannot ask the user questions
and cannot spawn nested subagents. Optional second wave: one **skeptic**
subagent per top-N claim; a skeptic must never return `supported` without a
retrieved URL.

## Source priority

1. `official` — company careers page, the JD itself, official engineering blog, official interview guide
2. `first_party` — company employees writing in official or clearly affiliated channels
3. `second_party` — reputable reporting, well-known prep sites that cite a source
4. `anecdote` — Blind, Reddit, Glassdoor, random YouTube

Rules:

- Official sources first. An anecdote may suggest a hypothesis; only official/first_party may state "the company's process is X".
- Use Exa search with targeted queries, then fetch pages before citing.
- Contradictions are recorded as **two ledger rows**, never averaged.

## Query recipes

- Role: `<company> <role> job description`, `site:<company>.com careers <role>`
- Loop: `<company> <role> interview process`, `<company> interview loop site:<company> eng blog`
- Tech/DSA: `<company> <role> interview questions systems design`, `<topic> interview preparation <level>`
- Skeptic pass: re-derive each top claim from its URL alone; check the quote exists.

## When to stop

Stop adding rows when:

- Each topic (role / loop / tech / dsa) has at least one non-anecdote row **or** an explicit inferred row saying what could not be found.
- The JD text itself is ingested (`ingest_jd`) and cited as `official`.
- Additional queries return pages already in the ledger.

Do not pad the ledger. Ten solid rows beat forty thin ones.
