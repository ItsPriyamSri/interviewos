import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const agentSpec = JSON.parse(readFileSync(join(ROOT, "agent.json"), "utf8"));

test("agent spec keeps publish_workspace behind human approval", () => {
  const interviewosServer = (agentSpec.mcp_servers ?? []).find(
    (s) => s.name === "interviewos",
  );
  assert.ok(interviewosServer, "interviewos MCP server must be attached");
  const gated = interviewosServer.require_approval_for_tools ?? [];
  assert.ok(
    gated.includes("publish_workspace") ||
      gated.includes("@write") ||
      gated.includes("@destructive") ||
      gated.includes("@all"),
    "publish_workspace must require approval in the agent spec",
  );
});

test("agent spec declares required capabilities and skills", () => {
  assert.equal(agentSpec.name, "interviewos");
  assert.ok(agentSpec.model?.name, "model.name must be present");
  const config = agentSpec.config ?? {};
  assert.equal(config.sandbox?.enabled, true, "sandbox required for skills/code mode");
  assert.equal(config.dynamic_sub_agents?.enabled, true);
  assert.equal(config.ask_user_questions?.enabled, true);
  const skills = (agentSpec.skills ?? []).map((s) => s.name ?? s);
  for (const expected of ["interviewos-research", "interviewos-ledger", "interviewos-workspace"]) {
    assert.ok(skills.includes(expected), `missing skill ${expected}`);
  }
});

test("no second TrueForge agent spec exists in the repo", () => {
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" });
  const extraSpecs = tracked
    .split("\n")
    .map((f) => f.trim())
    .filter(
      (f) =>
        /(^|\/)agent[^/]*\.json$/i.test(f) &&
        f !== "agent.json" &&
        !f.includes("package"),
    );
  assert.deepEqual(extraSpecs, [], "repo must contain exactly one agent spec: agent.json");
});

test("server marks publish_workspace destructive so the harness default gates it too", () => {
  const serverSource = readFileSync(join(ROOT, "mcp", "server.mjs"), "utf8");
  assert.match(serverSource, /destructiveHint:\s*true/, "publish tool must be annotated destructive");
});
