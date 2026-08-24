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

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MiB request cap (publish payload itself caps at 1 MiB)

function readBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        // Drain the rest so the client can finish writing, then answer 413.
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    req.on("end", () =>
      tooLarge
        ? rejectBody(Object.assign(new Error("request body too large"), { statusCode: 413 }))
        : resolveBody(Buffer.concat(chunks).toString("utf8")),
    );
    req.on("error", rejectBody);
  });
}

const httpServer = createServer(async (req, res) => {
  const pathname = (req.url ?? "/").split("?")[0];

  if (req.method === "POST" && pathname === "/mcp") {
    // Stateless mode: each request is self-contained; TrueForge just needs a URL.
    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      res.writeHead(err.statusCode ?? 400, { "Content-Type": "application/json", Connection: "close" });
      res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: err.message }, id: null }));
      return;
    }

    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      transport.close();
      server.close();
    };
    res.on("finish", cleanup);
    res.on("close", cleanup);
    await server.connect(transport);

    try {
      await transport.handleRequest(req, res, JSON.parse(body));
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
      }
      if (!res.writableEnded) {
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: `bad request: ${err.message}` }, id: null }));
      }
      cleanup();
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
