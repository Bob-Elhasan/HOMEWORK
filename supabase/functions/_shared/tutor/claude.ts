// The real model behind ModelFn: Claude through the Anthropic SDK.
// - Structured outputs force the reply into the ModelReply shape.
// - Top-level cache_control caches the lesson system prompt across turns.
// - Server-side fallbacks retry a declined request on another model.
// Default model and effort follow docs/roadmap.md (Opus 5.5, low effort);
// Phase 1 measures the alternatives with scripts/eval-tutor.ts.

import Anthropic from "@anthropic-ai/sdk";
import { REPLY_SCHEMA } from "./prompt.ts";
import type { ModelFn, ModelReply, ModelResult } from "./types.ts";

export interface ClaudeOptions {
  apiKey?: string;
  model?: "claude-opus-5-5" | "claude-sonnet-5-5" | "claude-haiku-5-5";
  effort?: "low" | "medium" | "high";
  fast?: boolean;
}

function parseReply(text: string): ModelReply | null {
  try {
    const r = JSON.parse(text);
    if (typeof r.say !== "string" || !Array.isArray(r.board)) return null;
    return {
      say: r.say,
      board: r.board.filter((b: unknown) => typeof b === "string"),
      explanation_accepted: r.explanation_accepted === true,
      safety_concern: ["none", "unclear", "flag"].includes(r.safety_concern) ? r.safety_concern : "none",
    };
  } catch {
    return null;
  }
}

export function createClaudeModel(opts: ClaudeOptions = {}): ModelFn {
  const client = new Anthropic(opts.apiKey ? { apiKey: opts.apiKey } : {});
  const model = opts.model ?? "claude-opus-5-5";
  const effort = opts.effort ?? "low";
  // Haiku has no server-side fallback; the others use the default routing.
  const fallbackParams = model === "claude-haiku-5-5"
    ? {}
    : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

  return async (req): Promise<ModelResult> => {
    const started = Date.now();
    const response = await client.beta.messages.create({
      model,
      max_tokens: 4000,
      cache_control: { type: "ephemeral" },
      system: req.system,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
      thinking: { type: "adaptive" },
      output_config: { effort, format: { type: "json_schema", schema: REPLY_SCHEMA as unknown as Record<string, unknown> } },
      ...(opts.fast && model === "claude-opus-5-5" ? { speed: "fast" as const } : {}),
      ...fallbackParams,
    });
    const latencyMs = Date.now() - started;
    const u = response.usage;
    const usage = {
      input_tokens: u.input_tokens ?? 0,
      output_tokens: u.output_tokens ?? 0,
      cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
      cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
    };
    const priceKey = opts.fast && model === "claude-opus-5-5" ? "claude-opus-5-5:fast" : response.model;
    if (response.stop_reason === "refusal") {
      return { reply: null, failure: "refusal", usage, model: priceKey, latencyMs };
    }
    if (response.stop_reason === "max_tokens") {
      return { reply: null, failure: "max_tokens", usage, model: priceKey, latencyMs };
    }
    const text = response.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("");
    const reply = parseReply(text);
    return reply
      ? { reply, usage, model: priceKey, latencyMs }
      : { reply: null, failure: "invalid_output", usage, model: priceKey, latencyMs };
  };
}
