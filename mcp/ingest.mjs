import { fileURLToPath } from "node:url";

const BLOCKED_HOSTNAMES = new Set(["localhost"]);
const MAX_REDIRECTS = 5;

function isBlockedHost(hostname) {
  const host = String(hostname).toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  // IPv6 loopback, link-local, and v4-mapped forms
  if (host === "::1" || host === "::" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    return true;
  }
  const v4 = host.match(/^((?:\d{1,3}\.){3})\d{1,3}$/) ?? (host.startsWith("::ffff:") ? host.slice(7).match(/^((?:\d{1,3}\.){3})\d{1,3}$/) : null);
  if (v4) {
    const a = Number(v4[1].split(".")[0]);
    const b = Number(v4[1].split(".")[1] ?? "-1");
    if (a === 127 || a === 10 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
      return true;
    }
  }
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
  if (isBlockedHost(parsed.hostname)) {
    throw new Error(`blocked private/loopback host: ${parsed.hostname}`);
  }
  return parsed;
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

function guessCompany(text) {
  const explicit = text.match(/^\s*Company:\s*(.+)$/im);
  if (explicit?.[1]) return explicit[1].trim();
  const at = extractTitle(text)?.match(/^(.*?)\s+[-–—@]\s+/) ?? null;
  return "";
}

function guessTitle(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines[0] ?? "";
}

export async function ingestJd({ url, text, fetchImpl } = {}) {
  if (text && String(text).trim()) {
    const clean = String(text);
    return {
      title: guessTitle(clean),
      company_guess: guessCompany(clean),
      text: clean,
      source: "pasted",
    };
  }
  if (!url || !String(url).trim()) {
    throw new Error("ingest_jd needs a url or text");
  }

  const doFetch = fetchImpl ?? globalThis.fetch;
  let target = assertSafeUrl(url);

  let response;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    response = await doFetch(target.toString());
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

  return {
    title: extractTitle(html) || guessTitle(body),
    company_guess: guessCompany(html),
    text: body,
    source: sourceUrl,
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  // CLI debug helper: node mcp/ingest.mjs '<json>'
  const input = JSON.parse(process.argv[2] ?? "{}");
  ingestJd(input)
    .then((out) => console.log(JSON.stringify(out, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

export const _internal = { isBlockedHost, stripTags };
