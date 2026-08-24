# Golden-path prompt (paste into TrueForge chat with the `interviewos` agent)

Company: **Google**
Role: **Site Reliability Engineer, L4-ish IC**
Prep horizon: **4 weeks**

Job description (paste as-is):

---
{{ paste the full contents of fixtures/google-sre.jd.txt here }}
---

Resume (paste as-is):

---
{{ paste the full contents of fixtures/candidate.synthetic.md here }}
---

Instructions to the agent:

- Research Google's SRE interview process using your tools; cite every factual claim in an evidence ledger.
- Ask me clarifying questions first if level or timeline would change your research.
- Use parallel subagents for role / interview-loop / tech-DSA research.
- Compare the ledger against my resume and identify gaps.
- Draft `evidence.jsonl`, `brief.md`, `gaps.md`, and `plan.md`, then call
  `publish_workspace` with slug `google-sre` and wait for my approval.
- Do not tell me the workspace is published until the tool succeeds.
