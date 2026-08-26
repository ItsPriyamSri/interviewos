# Brief — Google Site Reliability Engineer (~L4 IC)

Prep horizon: 4 weeks. Candidate resume on file (see `gaps.md`).

> Provenance note: the job description supplied for this engagement is a marked synthetic
> fixture. Per its own header it is **not** cited as Google evidence anywhere in this
> workspace; every Google-specific claim below traces to a fetched public source in
> `evidence.jsonl`.

## Role summary

Google frames SRE as the combination of software and systems engineering applied to
large-scale, massively distributed, fault-tolerant systems [^E001], famously described
internally as "what happens when you ask a software engineer to design an operations team,"
with SREs hired directly through the standard software-engineer process [^E012]. The day-to-day
mix skews toward optimizing and hardening existing infrastructure rather than greenfield
feature work [^E002], and mid-level SRE postings list writing product or system development
code as an explicit responsibility [^E003], alongside participating in on-call rotation,
incident response, and driving postmortems [^E004].

The requirements bar for the mid-level posting ("Software Engineer III", seniority tier
"Mid") [^E010] is: a Bachelor's degree in CS or a related field, or equivalent practical
experience [^E005]; 2 years of software development experience [^E006]; coding ability in one
or more of C, C++, Java, Python, or Go [^E007]; and experience with algorithms and data
structures **or** Unix/Linux internals and administration [^E008]. A preferred qualification
adds 2 further years designing, analyzing, and troubleshooting large-scale distributed
systems [^E009]. For contrast, the next band up (Staff SRE, tier "Advanced") requires 8 years
of software development including 3 as an SRE [^E011].

Leveling caveats: Google postings do not print numeric L-levels, so "L4" ↔ Software Engineer
III/"Mid" is a community mapping that should be confirmed with the recruiter [INFERRED] [^E016];
third-party leveling guides place L4 at roughly 1–5 years of industry experience [^E015].
Google's own materials identify UNIX internals plus Layer 1–3 networking expertise as the
most common non-standard hiring route into SRE, with 50–60% of SREs entering via the standard
SWE process [^E013]. Service-health ownership is expressed through SLIs and SLOs chosen from
user journeys [^E014].

## Interview loop

Official Google sources describe the following skeleton; unofficial guides fill in round
counts and durations, and are labeled accordingly.

- **Assessment / pre-screen.** Most roles require a hiring assessment covering work-style
  tendencies [^E017]; screening can also include coding quizzes, short recruiter or
  hiring-manager chats, and hypothetical scenario questions [^E018]. Brain teasers are
  officially out [^E019].
- **Recruiter + phone screen.** Unofficially the pipeline runs recruiter call → technical
  phone screen(s) → onsite [^E025] *(partial — single guide)*; the phone screen is 1–2
  algorithm rounds worked on a shared doc [^E029] and is focused on data structures and
  algorithms [^E033]. Your coding language is declared up front, before the loop starts [^E037].
- **Onsite.** Two official anchors: Google's SRE research describes a dedicated design
  interview format called NALSD — developing a credible approach for a large-scale system
  [^E021] — and states that **every SRE candidate participates in exactly one NALSD
  interview** during recruiting [^E022]. Google also confirms structured interviewing (same
  questions per role, identical grading rubrics) [^E023] and advises being ready to write
  code by hand on a whiteboard or shared doc [^E024]. Unofficial round-count reports disagree
  and are kept as separate evidence, not averaged: generic-Google guides say 4–6 rounds,
  coding-first with an optional behavioral round [^E026]; an SRE-focused guide describes a
  shorter SRE loop including a 45-minute coding-and-scripting screen and a Linux/networking
  round [^E030]; one candidate's 2022 Systems-SRE virtual onsite had five components
  (practical coding/scripting, NALSD design, Linux internals, Linux troubleshooting,
  behavioral) [^E031]. No official Google page publishes exact onsite round counts or
  per-round durations [INFERRED] [^E032].
- **After the loop.** Google consolidates your application and interview feedback into a
  consolidated review involving many Googlers [^E020]. Unofficially, a hiring committee of
  4–5 engineers/EMs who did not interview you reviews the packet [^E027], and surviving
  candidates enter team matching, where recruiters propose teams and both sides opt in [^E028].

## Tech / DSA expectations

**Coding.** Screens weight data structures & algorithms heavily [^E033], and onsite rounds are
primarily coding — Google is reported to weigh coding above system design [^E034]. Evaluation
rewards complexity analysis over raw speed [^E035], with rubric dimensions of problem
decomposition, coding clarity, verification, and communication [^E036]; SRE-specific guidance
adds production-readiness at scale, edge-case handling, debugging, and thinking aloud [^E038].
One counterweight: a Systems-SRE candidate report claims the SRE coding round skips
trees/graphs in favor of resource-efficient scripting — a single-report anecdote recorded as
a contradiction, not a plan of record [^E039]. Official Google pages listing exact DSA topics
were not retrievable this session, so topic depth rests on the second-party rows above
[INFERRED] [^E040].

**Design / NALSD.** NALSD is Google's named design discipline for SRE, defined in the SRE
Workbook (Ch. 12) as combining capacity planning, component isolation, and graceful
degradation into an implementable design [^E041]. Expectations: convert a whiteboard diagram
into concrete resource estimates (machine counts, storage, bandwidth — reasoning matters more
than exact numbers) [^E042], and iterate the design against failure modes up to and including
full datacenter loss [^E043]. Google's SRE Classroom treats NALSD as fundamental to SRE and
publishes drill topics: sharding, replication, latency, load balancing [^E044].

**Reliability practice.** SLOs set a target reliability level and are core SRE practice [^E045],
and error budgets are the sanctioned mechanism for trading reliability against feature velocity
[^E046].

**Troubleshooting.** The SRE loop reportedly includes a dedicated 45-minute simulated-production-
outage round run in a shared document, with the interviewer supplying command outputs step by
step [^E047]; scoring rewards scoping before hypothesizing, systematic elimination across
CPU/memory/network, command fluency, and fix sequencing [^E048].

**Behavioral.** Google evaluates hires on four traits: general cognitive ability, leadership,
role-related knowledge, and "Googleyness" [^E049] — the latter meaning thriving amid ambiguity,
challenging the status quo, and caring about the team [^E050], assessed in a ~45-minute
behavioral round [^E051].

## Sources

[^E001]: careers.google.com — Software Engineer III, Site Reliability Engineering posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E002]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E003]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E004]: careers.google.com — Staff SRE posting · https://careers.google.com/jobs/results/82494378043417286-staff-site-reliability-engineer/
[^E005]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E006]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E007]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E008]: careers.google.com — SWE III SRE posting · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E009]: careers.google.com — SWE III SRE posting (preferred qualifications) · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E010]: careers.google.com — SWE III SRE posting (tier label) · https://careers.google.com/jobs/results/126564584885494470-software-engineer-iii-site-reliability-en
[^E011]: careers.google.com — Staff SRE posting · https://careers.google.com/jobs/results/82494378043417286-staff-site-reliability-engineer/
[^E012]: sre.google — SRE Book, Introduction (Treynor foreword) · https://sre.google/sre-book/introduction/
[^E013]: sre.google — SRE Book, Introduction · https://sre.google/sre-book/introduction/
[^E014]: sre.google — SRE Book, Service Level Objectives · https://sre.google/sre-book/service-level-objectives/
[^E015]: Software Engineering Levels at Google – Bandit Tracker · https://bandittracker.com/software-engineering-levels-at-google/
[^E016]: inferred — L-number mapping absent from official postings · (no URL)
[^E017]: Life at Google, "Interviews at Google" (official video) · https://www.youtube.com/watch?v=olScOTFtVW8
[^E018]: Life at Google, "Interviews at Google" (official video) · https://www.youtube.com/watch?v=olScOTFtVW8
[^E019]: Life at Google, "Interviews at Google" (official video) · https://www.youtube.com/watch?v=olScOTFtVW8
[^E020]: Life at Google, "Interviews at Google" (official video) · https://www.youtube.com/watch?v=olScOTFtVW8
[^E021]: research.google — "Interviewing for Systems Design Skills" (SRECon) · https://research.google/pubs/interviewing-for-systems-design-skills/
[^E022]: research.google — "Interviewing for Systems Design Skills" (SRECon) · https://research.google/pubs/interviewing-for-systems-design-skills/
[^E023]: rework.withgoogle.com — structured interviewing guide · https://rework.withgoogle.com (as cited in evidence.jsonl)
[^E024]: How to: Prepare for a Google Engineering Interview (Life at Google) · https://www.youtube.com/watch?v=ko-KkSmp-Lk
[^E025]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E026]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E027]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E028]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E029]: techinterviewhandbook.org — interview formats, top companies · https://techinterviewhandbook.org/interview-formats-top-companies/
[^E030]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E031]: bala-krishnan.com — Google Systems-SRE onsite report · http://www.bala-krishnan.com/posts/google-sre-onsite/
[^E032]: inferred — no official round counts/durations found · (no URL)
[^E033]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E034]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E035]: interviewing.io — Google hiring-process guide · https://interviewing.io/guides/hiring-process/google
[^E036]: codeintuition.io — what Google looks for in coding interviews · https://codeintuition.io/blogs/what-google-looks-for-coding-interview
[^E037]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E038]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E039]: bala-krishnan.com — Google Systems-SRE onsite report (anecdote) · http://www.bala-krishnan.com/posts/google-sre-onsite/
[^E040]: inferred — official DSA topic pages JS-rendered, unfetchable · (no URL)
[^E041]: sre.google — SRE Workbook, Non-Abstract Large System Design · https://sre.google/workbook/non-abstract-design/
[^E042]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
[^E043]: sre.google — SRE Workbook, NALSD · https://sre.google/workbook/non-abstract-design/
[^E044]: sre.google — SRE Classroom · https://sre.google/classroom/
[^E045]: sre.google — SRE Workbook, Implementing SLOs · https://sre.google/workbook/implementing-slos/
[^E046]: sre.google — SRE Workbook, Implementing SLOs · https://sre.google/workbook/implementing-slos/
[^E047]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E048]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
[^E049]: businessinsider.com — Google recruiting director on hire traits · https://www.businessinsider.com/google-jobs-interviews-humility-collaboration-teamwork-skills-kyle-ewing-2019-12
[^E050]: businessinsider.com — Google recruiting director on Googleyness · https://www.businessinsider.com/google-jobs-interviews-humility-collaboration-teamwork-skills-kyle-ewing-2019-12
[^E051]: tryexponent.com — Google SRE interview guide · https://www.tryexponent.com/guides/google-site-reliability-engineer-interview
