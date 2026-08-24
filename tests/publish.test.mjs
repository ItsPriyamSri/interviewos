import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { publishWorkspace } from "../mcp/publish.mjs";

const LEDGER = [
  {
    id: "E001",
    claim: "SRE loop has a reliability design round.",
    topic: "loop",
    source_url: "https://example.com/sre",
    source_title: "Example SRE guide",
    retrieved_at: "2026-08-24T00:00:00Z",
    class: "official",
    quote: "reliability design round",
    verdict: "supported",
    notes: "",
  },
].map((r) => JSON.stringify(r)).join("\n") + "\n";

function validFiles() {
  return [
    { path: "evidence.jsonl", content: LEDGER },
    { path: "brief.md", content: "The loop includes a design round [^E001].\n" },
    { path: "gaps.md", content: "" },
    { path: "plan.md", content: "P0: rehearse reliability design [^E001].\n" },
  ];
}

test("publish rejects confirm false", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    assert.throws(
      () =>
        publishWorkspace({
          slug: "acme-sre",
          confirm: false,
          files: validFiles(),
          outDir,
        }),
      /confirm/i,
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish rejects broken citations", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    const files = validFiles();
    files[1] = { path: "brief.md", content: "Invented stage [^E999].\n" };
    await assert.rejects(
      () => publishWorkspace({ slug: "acme-sre", confirm: true, files, outDir }),
      /E999|check_ledger/i,
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish accepts valid payload and writes files", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    const result = await publishWorkspace({
      slug: "acme-sre",
      confirm: true,
      files: validFiles(),
      outDir,
    });
    assert.equal(result.ok, true);
    assert.equal(result.slug, "acme-sre");
    assert.deepEqual(
      [...result.files].sort(),
      ["brief.md", "evidence.jsonl", "gaps.md", "plan.md"],
    );
    const brief = await readFile(join(outDir, "acme-sre", "brief.md"), "utf8");
    assert.ok(brief.includes("[^E001]"));
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish rejects slug with unsafe characters", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    assert.throws(
      () =>
        publishWorkspace({
          slug: "../escape",
          confirm: true,
          files: validFiles(),
          outDir,
        }),
      /slug/i,
    );
    assert.throws(
      () =>
        publishWorkspace({
          slug: "Acme SRE!",
          confirm: true,
          files: validFiles(),
          outDir,
        }),
      /slug/i,
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish rejects file paths that escape the workspace", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    const files = validFiles();
    files.push({ path: "../../evil.txt", content: "nope" });
    assert.throws(
      () => publishWorkspace({ slug: "acme-sre", confirm: true, files, outDir }),
      /path/i,
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish rejects oversized payloads", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    const files = validFiles();
    files[0] = { path: "evidence.jsonl", content: LEDGER + "x".repeat(1024 * 1024) };
    assert.throws(
      () => publishWorkspace({ slug: "big", confirm: true, files, outDir }),
      /(1 MiB|too large|payload)/i,
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish replaces stale files from a previous snapshot", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    await publishWorkspace({
      slug: "acme-sre",
      confirm: true,
      files: validFiles(),
      outDir,
    });
    // Re-publish with changed content must fully replace those files.
    const files = validFiles();
    files[2] = { path: "gaps.md", content: "updated gap analysis" };
    await publishWorkspace({ slug: "acme-sre", confirm: true, files, outDir });
    const gaps = await readFile(join(outDir, "acme-sre", "gaps.md"), "utf8");
    assert.equal(gaps, "updated gap analysis");
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish rejects files outside the four-artifact contract", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    const extra = [...validFiles(), { path: "extra.md", content: "old" }];
    assert.throws(
      () => publishWorkspace({ slug: "acme-sre", confirm: true, files: extra, outDir }),
      /unexpected file path|exactly/i,
    );
    const nested = validFiles();
    nested[1] = { path: "nested/brief.md", content: "x" };
    assert.throws(
      () => publishWorkspace({ slug: "acme-sre", confirm: true, files: nested, outDir }),
      /unexpected file path|exactly/i,
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("publish rejects binary-looking content", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "pub-"));
  try {
    const files = validFiles();
    files[1] = { path: "brief.md", content: "ok\u0000\u0007bad" };
    assert.throws(
      () => publishWorkspace({ slug: "bin", confirm: true, files, outDir }),
      /binary/i,
    );
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});
