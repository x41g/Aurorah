import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/requestSecurity";
import { isTurnstileEnabled, verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function getHashSecrets(): string[] {
  const single = String(process.env.TRANSCRIPT_HASH_SECRET || "").trim();
  const csv = String(process.env.TRANSCRIPT_HASH_SECRETS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [single, ...csv].filter(Boolean);
  return Array.from(new Set(all));
}

function normalizePasswordInput(input: string): string {
  return String(input || "")
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, "");
}

function buildPasswordCandidates(input: string, guildSlug: string): string[] {
  const normalized = normalizePasswordInput(input);
  if (!normalized) return [];

  const out = new Set<string>();
  out.add(normalized);
  out.add(normalized.toLowerCase());
  out.add(normalized.toUpperCase());

  // Formato esperado: guildSlug-CODIGO (codigo em maiusculo).
  const dash = normalized.lastIndexOf("-");
  if (dash > 0 && dash < normalized.length - 1) {
    const prefix = normalized.slice(0, dash).toLowerCase();
    const code = normalized.slice(dash + 1).toUpperCase();
    out.add(`${prefix}-${code}`);
  }

  // Se o usuario digitou apenas o codigo, tenta prefixar com o guildSlug do registro.
  if (guildSlug && !normalized.includes("-")) {
    out.add(`${guildSlug.toLowerCase()}-${normalized.toUpperCase()}`);
  }

  return Array.from(out);
}

function buildHashCandidates(passwordCandidate: string, secret: string): string[] {
  const p = String(passwordCandidate || "");
  const s = String(secret || "");
  const out = new Set<string>();

  // formatos atuais
  out.add(sha256(`${p}|${s}`));
  out.add(sha256(`${p}:${s}`));

  // compatibilidade legada (caso tenha mudado no passado)
  out.add(sha256(`${p}`));
  out.add(sha256(`${s}${p}`));
  out.add(sha256(`${p}${s}`));
  out.add(sha256(`${s}|${p}`));
  out.add(sha256(`${s}:${p}`));

  return Array.from(out);
}

function sanitizeSlug(input: string): string {
  return decodeURIComponent(String(input || ""))
    .trim()
    .replace(/\.html$/i, "")
    .replace(/^\/+|\/+$/g, "");
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipRate = consumeRateLimit(`transcript-verify-ip:${ip}`, 120, 60_000);
    if (!ipRate.allowed) {
      return Response.json(
        { error: "too_many_requests" },
        { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSec) } }
      );
    }

    const { slug, password, captchaToken }: { slug?: string; password?: string; captchaToken?: string } = await req.json();

    const pw = String(password || "").trim();
    const s = sanitizeSlug(String(slug || ""));
    if (!s || !pw) return Response.json({ error: "bad_request" }, { status: 400 });

    if (isTurnstileEnabled()) {
      if (!String(captchaToken || "").trim()) {
        return Response.json({ error: "captcha_required" }, { status: 400 });
      }
      const captcha = await verifyTurnstileToken({ token: String(captchaToken || ""), remoteIp: ip });
      if (!captcha.ok) {
        return Response.json({ error: "captcha_failed" }, { status: 403 });
      }
    }

    const pairRate = consumeRateLimit(`transcript-verify:${ip}:${s.toLowerCase()}`, 20, 60_000);
    if (!pairRate.allowed) {
      return Response.json(
        { error: "too_many_attempts" },
        { status: 429, headers: { "Retry-After": String(pairRate.retryAfterSec) } }
      );
    }

    let row = await prisma.transcript.findUnique({ where: { slug: s } });
    if (!row && s.toLowerCase() !== s) {
      row = await prisma.transcript.findUnique({ where: { slug: s.toLowerCase() } });
    }
    if (!row) return Response.json({ error: "not_found" }, { status: 404 });

    if (row.expireAt && Date.now() > row.expireAt.getTime()) {
      return Response.json({ error: "expired" }, { status: 410 });
    }

    const expectedHash = String(row.passHash || "");
    const secrets = getHashSecrets();
    if (!secrets.length) throw new Error("TRANSCRIPT_HASH_SECRET(S) missing");

    const candidates = buildPasswordCandidates(pw, String(row.guildSlug || ""));
    const hashes = new Set<string>();
    for (const candidate of candidates) {
      for (const secret of secrets) {
        for (const h of buildHashCandidates(candidate, secret)) {
          hashes.add(h);
        }
      }
    }

    if (!expectedHash || !hashes.has(expectedHash)) {
      return Response.json({ error: "wrong_password" }, { status: 401 });
    }

    if (!String(row.html || "").trim()) {
      return Response.json({ error: "empty_transcript" }, { status: 404 });
    }

    return Response.json({ ok: true, html: row.html }, { status: 200 });
  } catch (err: any) {
    console.error("[transcript/verify] error:", err);
    return Response.json(
      { error: "server_error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
