export type PromptSecurityPolicy = {
  stripMentions: boolean
  stripLinks: boolean
  blockJailbreakHints: boolean
}

export const defaultPromptSecurityPolicy: PromptSecurityPolicy = {
  stripMentions: true,
  stripLinks: true,
  blockJailbreakHints: true,
}

const JAILBREAK_PATTERNS = [
  /ignore\s+previous\s+instructions?/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /developer\s+mode/i,
  /act\s+as\s+if\s+you\s+are\s+system/i,
]

export function sanitizePrompt(prompt: string, policy: PromptSecurityPolicy) {
  let out = String(prompt || "")
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "")
    .trim()

  if (policy.stripMentions) {
    out = out
      .replace(/@everyone/gi, "[everyone]")
      .replace(/@here/gi, "[here]")
      .replace(/<@&\d+>/g, "[role]")
      .replace(/<@!?\d+>/g, "[user]")
  }

  if (policy.stripLinks) {
    out = out.replace(/https?:\/\/\S+/gi, "[link]")
  }

  return out
}

export function validatePromptSecurity(prompt: string, policy: PromptSecurityPolicy) {
  if (!prompt) return { ok: true as const }
  if (prompt.length > 4000) return { ok: false as const, error: "prompt_too_long" }

  if (policy.blockJailbreakHints) {
    const matched = JAILBREAK_PATTERNS.find((re) => re.test(prompt))
    if (matched) return { ok: false as const, error: "prompt_blocked_by_policy" }
  }

  return { ok: true as const }
}
