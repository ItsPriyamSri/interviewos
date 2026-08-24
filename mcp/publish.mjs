import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHECKER = join(REPO_ROOT, "scripts", "check_ledger.py");
const DEFAULT_OUT_DIR = join(REPO_ROOT, "mcp", ".published");

const MAX_TOTAL_BYTES = 1024 * 1024; // 1 MiB payload cap
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Control characters that indicate binary content (tab/newline/CR allowed)
const BINARY_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

function checkSlug(slug) {
  if (typeof slug !== "string" || !SLUG_RE.test(slug) || slug.length > 128) {
    throw new Error(`invalid slug (want lowercase-hyphen filesystem-safe): ${JSON.stringify(slug)}`);
  }
}

function validateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("files must be a non-empty array of { path, content }");
  }
  let totalBytes = 0;
  const seen = new Set();
  const safeEntries = [];
  for (const file of files) {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string") {
      throw new Error("each file needs string path and content");
    }
    const rel = file.path.replaceAll("\\", "/");
    if (/^[a-z]:/i.test(rel)) {
      throw new Error(`unsafe file path: ${file.path}`);
    }
    const segments = rel.split("/").filter((s) => s.length > 0);
    if (
      segments.length === 0 ||
      rel.startsWith("/") ||
      segments.some((s) => s === "." || s === "..")
    ) {
      throw new Error(`unsafe file path: ${file.path}`);
    }
    if (seen.has(rel)) {
      throw new Error(`duplicate file path: ${file.path}`);
    }
    seen.add(rel);
    if (BINARY_RE.test(file.content)) {
      throw new Error(`binary content rejected in ${file.path}`);
    }
    totalBytes += Buffer.byteLength(file.content, "utf8");
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new Error("payload too large: cap is 1 MiB total");
    }
    safeEntries.push({ segments, content: file.content });
  }
  return safeEntries;
}

function runChecker(dir) {
  const result = spawnSync(process.env.PYTHON ?? "python3", [CHECKER, dir], {
    encoding: "utf8",
  });
  if (result.error) {
    throw new Error(`check_ledger failed to run: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`check_ledger rejected workspace:\n${(result.stderr ?? "").trim()}`);
  }
}

export function publishWorkspace({ slug, confirm, files, outDir = DEFAULT_OUT_DIR } = {}) {
  // Synchronous validation so misuse throws before any side effect.
  if (confirm !== true) {
    throw new Error("publish requires confirm: true");
  }
  checkSlug(slug);
  const safeEntries = validateFiles(files);

  return (async () => {
    const staging = await mkdtemp(join(tmpdir(), "interviewos-publish-"));
    try {
      for (const { segments, content } of safeEntries) {
        const dest = join(staging, ...segments);
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, content, "utf8");
      }

      runChecker(staging);

      const finalDir = join(outDir, slug);
      // Replace any previous snapshot so a re-publish never leaves stale files.
      await rm(finalDir, { recursive: true, force: true });
      await mkdir(finalDir, { recursive: true });
      for (const { segments, content } of safeEntries) {
        const dest = join(finalDir, ...segments);
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, content, "utf8");
      }

      const names = files.map((f) => f.path).sort();
      const summary = [
        `Published workspace \`${slug}\` with ${names.length} file(s):`,
        ...names.map((n) => `- ${n}`),
        "",
        "Ledger check passed (`scripts/check_ledger.py`).",
      ].join("\n");

      return { ok: true, slug, files: names, summary, outDir: finalDir };
    } finally {
      await rm(staging, { recursive: true, force: true }).catch(() => {});
    }
  })();
}
