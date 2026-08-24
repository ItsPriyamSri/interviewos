import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { ingestJd } from "./ingest.mjs";
import { publishWorkspace } from "./publish.mjs";

const PORT = Number(process.env.MCP_PORT ?? 8788);

function buildServer() {
  const server = new McpServer({ name: "interviewos", version: "0.1.0" });

  server.registerTool(
    "ingest_jd",
    {
      description:
        "Normalize a job description from a public URL or pasted text into { title, company_guess, text, source }. Read-only.",
      inputSchema: {
        url: z.string().optional().describe("Public URL of the job description"),
        text: z.string().optional().describe("Pasted job description text"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ url, text }) => {
      try {
        const out = await ingestJd({ url, text });
        return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `error: ${err.message}` }], isError: true };
      }
    },
  );

  server.registerTool(
    "publish_workspace",
    {
      description:
        "Publish the InterviewOS workspace. Takes the draft files from the sandbox, runs scripts/check_ledger.py on them, and materializes the final workspace for download. This is an irreversible write action and requires human approval.",
      inputSchema: {
        slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).describe("Filesystem-safe company-role slug, e.g. google-sre"),
        confirm: z.literal(true).describe("Must be true; publishing is irreversible"),
        files: z
          .array(z.object({ path: z.string(), content: z.string() }))
          .describe("The four workspace files with full contents read from the sandbox"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
    },
    async ({ slug, confirm, files }) => {
      try {
        const result = await publishWorkspace({ slug, confirm, files });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `error: ${err.message}` }], isError: true };
      }
    },
  );

  return server;
}

const httpServer = createServer(async (req, res) => {
  const pathname = new URL(req.url ?? "/", `http://${req.headers.host}`).pathname;
  if (req.method === "POST" && pathname === "/mcp") {
    let body = "";
    for await (const chunk of req) body += chunk;

    // Stateless mode: each request is self-contained; TrueForge just needs a URL.
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);

    try {
      await transport.handleRequest(req, res, JSON.parse(body));
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
      }
      res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: `bad request: ${err.message}` }, id: null }));
    }
    return;
  }

  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
    return;
  }

  res.writeHead(405).end();
});

httpServer.listen(PORT, () => {
  console.log(`interviewos MCP listening on http://localhost:${PORT}/mcp`);
});
