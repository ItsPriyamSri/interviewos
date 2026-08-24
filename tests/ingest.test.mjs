import { test } from "node:test";
import assert from "node:assert/strict";
import { ingestJd } from "../mcp/ingest.mjs";

const JD_TEXT = `Senior Site Reliability Engineer — Acme Rockets

Company: Acme Rockets
We build rockets. You will keep them launching.
Requirements: Kubernetes, SLOs, on-call empathy.`;

test("ingestJd pasted text returns source pasted", async () => {
  const out = await ingestJd({ text: JD_TEXT });
  assert.equal(out.source, "pasted");
  assert.ok(out.text.includes("Acme"));
  assert.equal(typeof out.title, "string");
  assert.ok(out.title.length > 0);
  assert.equal(typeof out.company_guess, "string");
});

test("ingestJd extracts company from Company: line", async () => {
  const out = await ingestJd({ text: JD_TEXT });
  assert.equal(out.company_guess, "Acme Rockets");
});

test("ingestJd with neither url nor text throws", async () => {
  await assert.rejects(() => ingestJd({}), /url or text/i);
  await assert.rejects(() => ingestJd({ url: "", text: "" }), /url or text/i);
});

const blocked = [
  "http://127.0.0.1/jd",
  "http://127.7.7.7/jd",
  "http://10.1.2.3/jd",
  "http://169.254.169.254/latest/meta-data",
  "http://[::1]/jd",
];

for (const url of blocked) {
  test(`ingestJd blocks SSRF target ${url}`, async () => {
    await assert.rejects(() => ingestJd({ url }), /blocked|private|loopback/i);
  });
}

function fakeFetch(html, finalUrl) {
  return async (url) => ({
    ok: true,
    status: 200,
    url: finalUrl ?? url,
    text: async () => html,
  });
}

test("ingestJd fetches URL and strips tags", async () => {
  const html =
    "<html><head><title>SRE at Globex</title></head><body><h1>Site Reliability Engineer</h1><p>Do reliability.</p><script>evil()</script></body></html>";
  const out = await ingestJd({
    url: "https://jobs.example.com/sre",
    fetchImpl: fakeFetch(html),
  });
  assert.equal(out.source, "https://jobs.example.com/sre");
  assert.equal(out.title, "SRE at Globex");
  assert.ok(out.text.includes("Site Reliability Engineer"));
  assert.ok(!out.text.includes("evil()"));
});

test("ingestJd follows redirects but re-checks SSRF on each hop", async () => {
  let calls = 0;
  const impl = async (url) => {
    calls += 1;
    if (String(url).startsWith("https://ok.example.com")) {
      return { ok: true, status: 302, url, headers: new Headers({ location: "http://169.254.169.254/x" }), text: async () => "" };
    }
    throw new Error("should not fetch blocked host");
  };
  await assert.rejects(
    () =>
      ingestJd({
        url: "https://ok.example.com/a",
        fetchImpl: impl,
      }),
    /blocked|private|loopback/i,
  );
  assert.equal(calls, 1);
});
