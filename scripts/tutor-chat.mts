// Chat with the tutor in the terminal, on the sample fractions lesson.
// Needs ANTHROPIC_API_KEY. Each turn costs about a cent on Opus 5.5.
//
//   node scripts/tutor-chat.mts [--grade 5] [--ar] [--model claude-sonnet-5-5]
//
// Shows what the server does behind each reply (hints unlocked, blocked
// leaks, safety pause) and the running cost.

import { readFileSync } from "node:fs";
import * as readline from "node:readline/promises";
import { createClaudeModel } from "../supabase/functions/_shared/tutor/claude.ts";
import { newSession, openingLine, runTurn } from "../supabase/functions/_shared/tutor/session.ts";
import type { Lesson } from "../supabase/functions/_shared/tutor/types.ts";

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const lesson: Lesson = JSON.parse(readFileSync("content/alsson-us-ccss-ngss/math/g5/fractions/add-unlike-denominators.json", "utf8"));
const model = createClaudeModel({ model: (flag("--model") ?? "claude-opus-5-5") as "claude-opus-5-5" });

let result = openingLine(lesson, newSession(lesson, Number(flag("--grade") ?? lesson.grade), args.includes("--ar") ? "ar" : "en"));
console.log(`\nIbi: ${result.say}\n`);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
while (result.state.phase !== "done") {
  const msg = await rl.question("You: ");
  if (msg.trim() === "/quit") break;
  result = await runTurn(lesson, result.state, msg, model);
  console.log(`\nIbi: ${result.say}`);
  for (const line of result.board) console.log(`  [board] ${line}`);
  const notes = result.events.map((e) => e.type).join(", ");
  console.log(`  (${notes || "no events"} | turn $${result.costUsd.toFixed(4)} | session $${result.state.costUsd.toFixed(4)} | ${result.latencyMs} ms)\n`);
  if (result.showHelplines) console.log("  [screen shows helplines: unverified draft numbers]\n");
}
rl.close();
