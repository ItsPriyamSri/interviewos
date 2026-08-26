# Gaps — candidate resume vs evidence ledger

Resume on file: synthetic fixture candidate (see fixtures/candidate.synthetic.md), 5 years — Platform Engineer
(2022–present, K8s multi-tenant platform, ~40 services), Backend Developer @ DataForge
(2020–2022, Go REST APIs). Self-assessed gaps included in the resume are treated as candidate
claims and cross-checked below; no external verification of the resume was performed.

## Where the resume already meets the bar

- **Language requirement**: posting asks for coding in C/C++/Java/Python/Go [^E007]; resume
  shows strong Python and working Go plus production Bash — covered.
- **Experience floor**: posting requires 2 years of software development [^E006] and a
  Bachelor's or equivalent [^E005]; resume shows 5 years and a B.Sc. CS — covered.
- **Automation & incident practice**: responsibilities include automation to cut toil,
  on-call, incidents, and postmortems [^E002] [^E004]; resume shows Terraform/GitHub Actions
  automation (45→12 min releases), 6-person on-call rotation, 10+ postmortems — covered.
- **Monitoring tooling familiarity**: Prometheus/Grafana dashboarding experience aligns with
  the monitoring/alerting expectation [^E014], though formal SLO ownership is a gap (G2).

## Gap register

**[^G1] Algorithms & data structures readiness — severity: HIGH → P0**
Requirement: algorithms/data structures is an explicit minimum qualification [^E008], the
phone screen is 1–2 algorithm rounds [^E029] focused on DSA [^E033], and onsite coding is
weighted above system design with complexity-analysis expectations [^E034] [^E035].
Resume shows instead: last leetcode-style prep in 2021 (self-assessed "rusty"); production
Python/Go but no recent algorithm-drilling evidence. Interview format punishes exactly this.

**[^G2] Formal SLO / error-budget practice — severity: HIGH → P0**
Requirement: Google centers service health on SLIs/SLOs chosen from user journeys [^E014];
SLOs set target reliability as core practice [^E045] and error budgets drive reliability-vs-
velocity prioritization [^E046]. Resume shows instead: Prometheus/Grafana dashboards built,
but self-assessed "aware of concepts only" — no SLI spec, SLO target, or burn-rate alerting
owned end-to-end.

**[^G3] NALSD / capacity-planning reps — severity: HIGH → P0**
Requirement: every Google SRE candidate faces exactly one NALSD interview [^E021] [^E022],
expecting concrete machine/storage/bandwidth estimates from a whiteboard sketch [^E042],
failure-mode iteration up to datacenter loss [^E043], and capacity-planning-plus-graceful-
degradation synthesis [^E041]. Resume shows instead: no capacity-planning or hardware-sizing
experience at any scale (self-assessed); largest system ~200 nodes.

**[^G4] Linux internals & networking depth — severity: MEDIUM → P1**
Requirement: Unix/Linux internals is an alternative minimum qualification [^E008]; UNIX
internals plus Layer 1–3 networking is Google's most-cited alternate SRE skill profile [^E013];
troubleshooting rounds score systematic CPU/memory/network elimination and command fluency
[^E048]. Resume shows instead: adjacent evidence (Kubernetes ops, Bash tooling) but no explicit
Linux-internals or TCP/IP/DNS/load-balancing depth.

**[^G5] Distributed-systems scale depth — severity: MEDIUM → P1**
Requirement: preferred qualification adds 2 years designing/analyzing/troubleshooting
large-scale distributed systems [^E009]. Resume shows instead: solid multi-tenant platform ops
(~40 services) but capped around ~200 nodes; no first-hand very-large-scale fan-out,
replication-at-scale, or hot-partition war stories.

**[^G6] Structured behavioral narrative ("Googleyness") — severity: MEDIUM-LOW → P1**
Requirement: four-trait evaluation including leadership and Googleyness [^E049] — ambiguity
tolerance, challenging the status quo, team orientation [^E050] — assessed in a dedicated
~45-minute round [^E051]. Resume shows instead: strong raw material (postmortems, on-call,
cross-team platform work) but no structured STAR stories prepared against those traits.

**[^G7] Track & level calibration — severity: LOW → P2**
Requirement context: postings never print L-numbers [INFERRED] [^E016], L4↔"Mid"/SWE III is a
community mapping [^E010] [^E015], and one anecdote claims Systems-SRE coding rounds de-emphasize
trees/graphs in favor of resource-efficient scripting [^E039] while unofficial guides split
SRE loops into distinct tracks [^E030]. Resume shows instead: no data to disambiguate which
track/level the recruiter will slot — cheap to resolve on the recruiter call, risky to guess.

## Sources

[^E002]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E004]: careers.google.com — Staff SRE posting · https://careers.google.com/jobs/results/82494378043417286-staff-site-reliability-engineer/
[^E005]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E006]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E007]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E008]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E010]: careers.google.com — SWE III SRE posting (tier label) · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E013]: sre.google — SRE Book, Introduction · https://sre.google/sre-book/introduction/
[^E014]: sre.google — SRE Book, Service Level Objectives · https://sre.google/sre-book/service-level-objectives/
[^E015]: Software Engineering Levels at Google – Bandit Tracker · https://bandittracker.com/software-engineering-levels-at-google/
[^E016]: inferred — L-numbers absent from official postings · (no URL)
[^E021]: research.google — Interviewing for Systems Design Skills · https://research.google/pubs/interviewing-for-systems-design-skills/
[^E022]: research.google — Interviewing for Systems Design Skills · https://research.google/pubs/interviewing-for-systems-design-skills/
[^E029]: techinterviewhandbook.org — interview formats · https://techinterviewhandbook.org/interview-formats-top-companies/
[^E030]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E033]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E034]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E035]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E039]: bala-krishnan.com — Systems-SRE onsite report (anecdote) · http://www.bala-krishnan.com/posts/google-sre-onsite/
[^E041]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
[^E042]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
[^E043]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
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
