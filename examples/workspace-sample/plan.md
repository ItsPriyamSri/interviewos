# Plan — Google SRE (~L4), 4-week horizon

Only gaps from `gaps.md` generate work items; every item cites its gap [^G#] and its evidence
rows [^E###]. Cadence assumes ~10–12 focused hours/week alongside a full-time job; P0s are
scheduled first because they target official-requirement gaps that are clearly missing today.

## P0 — must-do before any interview date (weeks 1–2 core, maintained after)

**P0.1 Daily DSA block (60–90 min/day) [^G1] [^E008] [^E029] [^E033] [^E034] [^E035]**
Rebuild the rusted layer: arrays/strings → hash maps → two pointers → trees/BST → graphs
(BFS/DFS/topo) → heaps → DP basics. Every problem solved aloud with explicit complexity
analysis, mirroring how screens score decomposition/clarity/verification/communication [^E036]
and production-readiness signals like edge-case handling [^E038]. Python as primary language
(declared up front per loop convention [^E037]); 2 timed 45-min mock screens/week from week 2,
matching the reported phone-screen format of 1–2 algorithm rounds on a shared doc [^E029].

**P0.2 SLO/error-budget lab on a real service (weekend 1 + evenings week 2) [^G2] [^E014] [^E045] [^E046]**
Pick the payments-style service from the resume's Prometheus/Grafana work and produce: an SLI
spec derived from user journeys [^E014], an SLO with explicit target [^E045], an error-budget
policy with burn-rate alerting wired to existing dashboards [^E046], and one written
"budget exhausted → freeze features" decision memo. Deliverable doubles as interview
artefact for role-related-knowledge questions.

**P0.3 Weekly NALSD drill, 3 iterations (Sundays, weeks 1–4) [^G3] [^E041] [^E042] [^E043] [^E044]**
One prompt per week from SRE Classroom topics — sharding, replication, latency, load
balancing [^E044]. Each drill: whiteboard architecture → concrete machine/storage/bandwidth
estimates with reasoning shown [^E042] → failure-mode pass escalating to datacenter-loss
scenarios [^E043] → graceful-degradation redesign [^E041]. Log estimates in a running doc so
order-of-magnitude instincts compound across weeks.

## P1 — high-value, schedule weeks 3–4 (start light in week 2)

**P1.1 Linux internals + networking cram with troubleshooting drills [^G4] [^E008] [^E013] [^E048]**
TCP handshake/congestion control, DNS resolution path, L4/L7 load balancing, cgroups/namespaces,
filesystem+memory basics — chosen because Unix internals plus Layer 1–3 networking is Google's
most-cited alternate SRE skill profile [^E013] and an alternative minimum qualification [^E008].
Practice as 45-min outage simulations in a shared doc: scope before hypothesizing, eliminate
CPU/memory/network systematically, narrate commands (`ss`, `tcpdump`, `top`/`htop`, `dig`,
`kubectl describe`) exactly as the troubleshooting round scores it [^E048].

**P1.2 Scale-depth storytelling for distributed-systems probes [^G5] [^E009]**
Rewrite the ~40-service/~200-node platform experience in distributed-systems vocabulary:
fan-out amplification, retry storms/backpressure, hot partitions, multi-region blast radius.
Prep honest answers for preferred-qualification territory (designing/troubleshooting at scale
[^E009]) that concede the scale ceiling while showing transferable reasoning — never bluff
Google-scale operations.

**P1.3 Six STAR stories mapped to the four evaluated traits [^G6] [^E049] [^E050] [^E051]**
From resume raw material (10+ postmortems, on-call leadership, release-pipeline overhaul):
two stories each demonstrating ambiguity navigation and status-quo challenge ("Googleyness"
per its own definition [^E050]), team-oriented collaboration, and individual leadership —
rehearsed against the four-trait evaluation frame [^E049] and the dedicated behavioral round
format [^E051].

## P2 — cheap de-risking, do once

**P2.1 Recruiter-call checklist [^G7] [^E010] [^E015] [^E016] [^E030] [^E039]**
Confirm: numeric level mapping (postings print tiers, not L-numbers [^E016]; community maps
L4 ↔ SWE III/"Mid" [^E010] [^E015]), which SRE track applies (unofficial guides split SRE loops by track [^E030]), and whether coding rounds expect general DS&A or scripting emphasis —
the trees/graphs-skip claim is single-report anecdote [^E039] and must be verified, not assumed.
Also confirm onsite round count, since no official source publishes one [INFERRED].

## Mock cadence (locks the plan together)

- End week 2: full timed coding screen (P0.1 exit criteria: two mediums in 45 min with spoken
  complexity analysis).
- Week 3: NALSD mock with a peer playing interviewer (P0.3 + P1.1 integration).
- Week 4: full-loop simulation day — coding screen + NALSD + 45-min outage sim + behavioral
  round back-to-back; then taper.

## Sources

[^E008]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E009]: careers.google.com — SWE III SRE posting (preferred quals) · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E010]: careers.google.com — SWE III SRE posting (tier label) · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E013]: sre.google — SRE Book, Introduction · https://sre.google/sre-book/introduction/
[^E014]: sre.google — SRE Book, Service Level Objectives · https://sre.google/sre-book/service-level-objectives/
[^E015]: Software Engineering Levels at Google – Bandit Tracker · https://bandittracker.com/software-engineering-levels-at-google/
[^E016]: inferred — L-numbers absent from official postings · (no URL)
[^E029]: techinterviewhandbook.org — interview formats · https://techinterviewhandbook.org/interview-formats-top-companies/
[^E030]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E033]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E034]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E035]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E036]: codeintuition.io — Google coding rubric · https://codeintuition.io/blogs/what-google-looks-for-coding-interview
[^E037]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E038]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E039]: bala-krishnan.com — Systems-SRE onsite report (anecdote) · http://www.bala-krishnan.com/posts/google-sre-onsite/
[^E041]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
[^E042]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
[^E043]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
[^E044]: sre.google — SRE Classroom · https://sre.google/classroom/
[^E045]: sre.google — SRE Workbook, Implementing SLOs · https://sre.google/workbook/implementing-slos/
[^E046]: sre.google — SRE Workbook, Implementing SLOs · https://sre.google/workbook/implementing-slos/
[^E048]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E049]: businessinsider.com — Google recruiting director on hire traits · https://www.businessinsider.com/google-jobs-interviews-humility-collaboration-teamwork-skills-kyle-ewing-2019-12
[^E050]: businessinsider.com — Google recruiting director on Googleyness · https://www.businessinsider.com/google-jobs-interviews-humility-collaboration-teamwork-skills-kyle-ewing-2019-12
[^E051]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^G1]: gaps.md — DSA readiness gap (HIGH)
[^G2]: gaps.md — SLO/error-budget practice gap (HIGH)
[^G3]: gaps.md — NALSD/capacity-planning gap (HIGH)
[^G4]: gaps.md — Linux internals & networking gap (MEDIUM)
[^G5]: gaps.md — Distributed-systems scale gap (MEDIUM)
[^G6]: gaps.md — Behavioral narrative gap (MEDIUM-LOW)
[^G7]: gaps.md — Track/level calibration gap (LOW)
