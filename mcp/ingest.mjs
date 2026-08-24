import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";

const BLOCKED_HOSTNAMES = new Set(["localhost"]);
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 15000;

function isBlockedIp(ip) {
  const bare = ip.toLowerCase().replace(/^\[|\]$/g, "").split("%")[0];
  if (bare === "::1" || bare === "::") return true;
  if (bare.startsWith("fe80:") || bare.startsWith("fc") || bare.startsWith("fd")) return true;
  const v4text = /^(\d{1,3}\.){3}\d{1,3}$/.test(bare) ? bare : bare.startsWith("::ffff:") ? bare.slice(7) : null;
  if (v4text && /^(\d{1,3}\.){3}\d{1,3}$/.test(v4text)) {
    const [a, b] = v4text.split(".").map(Number);
    if (a === 127 || a === 10 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
      return true;
    }
  }
  return false;
}

function isBlockedHostname(hostname) {
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) return true;
  // Literal IPs (v4, v4-mapped v6, plain v6) are checked directly.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return isBlockedIp(hostname);
  if (hostname.includes(":")) return isBlockedIp(hostname);
  return false;
}

export function assertSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`invalid url: ${rawUrl}`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`blocked scheme ${parsed.protocol}`);
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error(`blocked private/loopback host: ${parsed.hostname}`);
  }
  return parsed;
}

async function assertPublicTarget(target, lookupImpl = (h) => dns.lookup(h, { all: true })) {
  const { hostname } = target;
  if (isBlockedHostname(hostname)) {
    throw new Error(`blocked private/loopback host: ${hostname}`);
  }
  let records;
  try {
    records = await lookupImpl(hostname);
  } catch {
    throw new Error(`could not resolve host: ${hostname}`);
  }
  for (const record of records ?? []) {
    if (isBlockedIp(record.address)) {
      throw new Error(`host ${hostname} resolves to private/loopback address ${record.address}`);
    }
  }
  if (!records || records.length === 0) {
    throw new Error(`could not resolve host: ${hostname}`);
  }
  // Return the validated address so the fetch can pin it, closing the
  // DNS-rebinding window between check and connection.
  return records[0].address;
}

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

// Minimal fetch-like wrapper that connects to a pre-validated IP while
// keeping SNI/Host on the original hostname.
function fetchViaIp(target, address) {
  return new Promise((resolvePromise, rejectPromise) => {
    const secure = target.protocol === "https:";
    const mod = secure ? https : http;
    const request = mod.request(
      {
        host: address,
        port: target.port || (secure ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        method: "GET",
        setHost: false,
        headers: {
          host: target.host,
          accept: "*/*",
          "user-agent": "InterviewOS/0.1 (+mcp ingest_jd)",
        },
        servername: secure ? target.hostname : undefined,
        timeout: FETCH_TIMEOUT_MS,
      },
      (response) => {
        const chunks = [];
        let size = 0;
        response.on("data", (chunk) => {
          size += chunk.length;
          if (size > MAX_RESPONSE_BYTES) {
            request.destroy(new Error("response body too large"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          resolvePromise({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            url: target.toString(),
            headers: { get: (name) => response.headers[name.toLowerCase()] ?? null },
            text: async () => Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    request.on("timeout", () => request.destroy(new Error("fetch timed out")));
    request.on("error", rejectPromise);
    request.end();
  });
}

function stripTags(html) {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function extractTitle(html) {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (t?.[1]?.trim()) return t[1].trim();
  const h = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h?.[1]?.trim()) return h[1].replace(/<[^>]+>/g, "").trim();
  return "";
}

function companyFromTitle(title) {
  if (!title) return "";
  const parts = title
    .split(/\s*(?:[-–—@|]|\bat\b|\bfor\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function guessCompany(text, title = "") {
  const explicit = text.match(/^\s*Company:\s*(.+)$/im);
  if (explicit?.[1]) return explicit[1].trim();
  return companyFromTitle(title);
}

function guessTitle(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines[0] ?? "";
}

export async function ingestJd({ url, text, fetchImpl, lookupImpl } = {}) {
  if (text && String(text).trim()) {
    const clean = String(text);
    const title = guessTitle(clean);
    return {
      title,
      company_guess: guessCompany(clean, title),
      text: clean,
      source: "pasted",
    };
  }
  if (!url || !String(url).trim()) {
    throw new Error("ingest_jd needs a url or text");
  }

  const doFetch = fetchImpl ?? globalThis.fetch;
  const doLookup = lookupImpl ?? ((h) => dns.lookup(h, { all: true }));
  let target = assertSafeUrl(url);

  let response;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const pinnedAddress = await assertPublicTarget(target, doLookup);
    // Pin the validated IP for the real connection (no injected fetchImpl),
    // so a DNS rebinding between check and connect cannot reach a private host.
    response =
      fetchImpl
        ? await fetchImpl(target.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
        : await fetchViaIp(target, pinnedAddress);
    if (response.status >= 300 && response.status < 400 && response.headers?.get?.("location")) {
      target = assertSafeUrl(new URL(response.headers.get("location"), target).toString());
      continue;
    }
    break;
  }
  if (!response.ok) {
    throw new Error(`fetch failed: HTTP ${response.status} for ${target}`);
  }

  const html = await response.text();
  const body = stripTags(html);
  const sourceUrl = response.url ? String(response.url) : target.toString();
  const title = extractTitle(html) || guessTitle(body);

  return {
    title,
    company_guess: guessCompany(html, title),
    text: body,
    source: sourceUrl,
  };
}

export const _internal = { isBlockedIp, isBlockedHostname, stripTags };
