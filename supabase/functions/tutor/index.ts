// Supabase Edge Function: one tutor turn per request.
//
// POST { lesson_id, grade?, locale?, message?, state? }
//   - No state: starts a session and returns the opening line.
//   - With state: runs one child turn.
// Returns { say, board, state, events, show_helplines, cost_usd, latency_ms }.
//
// Milestone 1 is a developer test endpoint: it is gated by TUTOR_DEV_TOKEN,
// keeps session state in a signed token instead of the database, and serves
// only lessons bundled below. It stores nothing. Required secrets:
// ANTHROPIC_API_KEY, TUTOR_STATE_SECRET, TUTOR_DEV_TOKEN.

import { createClaudeModel } from "../_shared/tutor/claude.ts";
import { newSession, openingLine, runTurn } from "../_shared/tutor/session.ts";
import { signState, verifyState } from "../_shared/tutor/state-token.ts";
import { HELPLINES } from "../_shared/tutor/safety.ts";
import type { Lesson, Locale } from "../_shared/tutor/types.ts";
import fractions from "../../../content/alsson-us-ccss-ngss/math/g5/fractions/add-unlike-denominators.json" with { type: "json" };

const LESSONS: Record<string, Lesson> = {
  [fractions.id]: fractions as Lesson,
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-tutor-dev-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

const model = createClaudeModel({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const devToken = Deno.env.get("TUTOR_DEV_TOKEN");
  const secret = Deno.env.get("TUTOR_STATE_SECRET");
  if (!devToken || !secret) return json({ error: "tutor not configured" }, 503);
  if (req.headers.get("x-tutor-dev-token") !== devToken) return json({ error: "forbidden" }, 403);

  let body: { lesson_id?: string; grade?: number; locale?: Locale; message?: string; state?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }

  const lesson = body.lesson_id ? LESSONS[body.lesson_id] : undefined;
  if (!lesson) return json({ error: "unknown lesson" }, 404);

  try {
    let result;
    if (!body.state) {
      const grade = Number.isInteger(body.grade) && body.grade! >= 2 && body.grade! <= 8 ? body.grade! : lesson.grade;
      result = openingLine(lesson, newSession(lesson, grade, body.locale === "ar" ? "ar" : "en"));
    } else {
      const state = await verifyState(body.state, secret);
      if (!state || state.lessonId !== lesson.id) return json({ error: "invalid session" }, 400);
      result = await runTurn(lesson, state, String(body.message ?? ""), model);
    }
    return json({
      say: result.say,
      board: result.board,
      state: await signState(result.state, secret),
      events: result.events,
      show_helplines: result.showHelplines,
      helplines: result.showHelplines ? HELPLINES : undefined,
      cost_usd: result.costUsd,
      session_cost_usd: result.state.costUsd,
      latency_ms: result.latencyMs,
    });
  } catch (err) {
    console.error("tutor turn failed", err instanceof Error ? err.message : "unknown");
    return json({ error: "tutor unavailable" }, 502);
  }
});
