// Live red-team run against the real model. Costs money: every case is one
// API call (roughly $0.01 each on Opus 5.5 at low effort, so about $1 for the
// full suite). Needs ANTHROPIC_API_KEY.
//
//   node scripts/eval-tutor.mts                       # Opus 5.5, low effort
//   node scripts/eval-tutor.mts --model claude-sonnet-5-5
//   node scripts/eval-tutor.mts --model claude-haiku-5-5 --limit 20
//   node scripts/eval-tutor.mts --fast                # Opus 5.5 fast mode
//
// Reports, per model: replies the guard had to block (the model tried to
// leak), replies that reached the child with a leak (must be 0), cost per
// turn, and latency. Writes evals/tutor/results/<model>-<date>.json.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createClaudeModel } from "../supabase/functions/_shared/tutor/claude.ts";
import { newSession, openingLine, runTurn } from "../supabase/functions/_shared/tutor/session.ts";
import { checkReply } from "../supabase/functions/_shared/tutor/leak-filter.ts";
import type { Lesson } from "../supabase/functions/_shared/tutor/types.ts";

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const modelName = (flag("--model") ?? "claude-opus-5-5") as "claude-opus-5-5" | "claude-sonnet-5-5" | "claude-haiku-5-5";
const effort = (flag("--effort") ?? "low") as "low" | "medium" | "high";
const fast = args.includes("--fast");
const limit = Number(flag("--limit") ?? Infinity);

const lesson: Lesson = JSON.parse(readFileSync("content/alsson-us-ccss-ngss/math/g5/fractions/add-unlike-denominators.json", "utf8"));
const suite: { cases: { id: string; category: string; message: string }[] } = JSON.parse(readFileSync("evals/tutor/red-team.json", "utf8"));
const model = createClaudeModel({ model: modelName, effort, fast });

const rows: Record<string, unknown>[] = [];
let blocked = 0, reachedChild = 0, cost = 0;
const latencies: number[] = [];
for (const c of suite.cases.slice(0, limit)) {
  const s = openingLine(lesson, newSession(lesson, 5)).state;
  const r = await runTurn(lesson, s, c.message, model);
  const guardBlocked = r.events.some((e) => e.type === "leak_blocked");
  const leaked = checkReply(r.say, r.board, lesson.questions[0].answer_key).leaked;
  if (guardBlocked) blocked++;
  if (leaked) reachedChild++;
  cost += r.costUsd;
  if (r.latencyMs) latencies.push(r.latencyMs);
  rows.push({ id: c.id, category: c.category, message: c.message, say: r.say, board: r.board, guardBlocked, leaked, costUsd: r.costUsd, latencyMs: r.latencyMs, events: r.events.map((e) => e.type) });
  process.stdout.write(leaked ? "L" : guardBlocked ? "b" : ".");
}
latencies.sort((a, b) => a - b);
const pct = (p: number) => latencies[Math.min(latencies.length - 1, Math.floor(p * latencies.length))] ?? 0;
const label = `${modelName}${fast ? "-fast" : ""}-${effort}`;
const summary = {
  model: label,
  cases: rows.length,
  leaksReachedChild: reachedChild,
  modelTriedToLeak: blocked,
  costUsdTotal: Number(cost.toFixed(4)),
  costUsdPerTurn: Number((cost / Math.max(1, rows.length)).toFixed(5)),
  latencyMsP50: pct(0.5),
  latencyMsP90: pct(0.9),
};
console.log(`\n${JSON.stringify(summary, null, 2)}`);
mkdirSync("evals/tutor/results", { recursive: true });
const out = `evals/tutor/results/${label}-${new Date().toISOString().slice(0, 10)}.json`;
writeFileSync(out, JSON.stringify({ summary, rows }, null, 1));
console.log(`Saved ${out}`);
process.exit(reachedChild === 0 ? 0 : 1);
