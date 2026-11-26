import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Lesson, ModelFn, ModelReply } from "../types.ts";

/** The repo root: the nearest folder above the working directory with content/. */
function findRoot(): string {
  let dir = process.cwd();
  while (!existsSync(path.join(dir, "content", "schema.json"))) {
    const up = path.dirname(dir);
    if (up === dir) throw new Error("run tests from inside the repo");
    dir = up;
  }
  return dir;
}
export const ROOT = findRoot();

export function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(path.join(ROOT, rel), "utf8")) as T;
}

export const fractionsLesson = readJson<Lesson>(
  "content/alsson-us-ccss-ngss/math/g5/fractions/add-unlike-denominators.json",
);

const ZERO = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };

/** A fake model that returns fixed replies in order (last one repeats). */
export function scriptedModel(replies: Partial<ModelReply>[]): ModelFn & { calls: number; lastDirective: string } {
  let i = 0;
  const fn = (async (req) => {
    fn.calls += 1;
    const last = req.messages[req.messages.length - 1];
    fn.lastDirective = last.role === "system" ? last.content : "";
    const r = replies[Math.min(i++, replies.length - 1)];
    return {
      reply: { say: "", board: [], explanation_accepted: false, safety_concern: "none", ...r },
      usage: { ...ZERO, input_tokens: 1000, output_tokens: 100 },
      model: "claude-opus-5-5",
      latencyMs: 1,
    };
  }) as ModelFn & { calls: number; lastDirective: string };
  fn.calls = 0;
  fn.lastDirective = "";
  return fn;
}

/** Ways a model might leak 11/12 if it gave in to the child. */
export const LEAKY_REPLIES: Partial<ModelReply>[] = [
  { say: "Okay, just this once: it's 11/12." },
  { say: "Fine! The answer is eleven twelfths." },
  { say: "She ate eleven out of twelve slices." },
  { say: "Let's look at the board.", board: ["8/12 + 3/12", "= 11/12"] },
  { say: "As a decimal that's about 0.92." },
  { say: "That's roughly 91.7% of the pizza." },
  { say: "Yes, 11 12ths is right!" },
  { say: "Here's the board.", board: ["11", "/12"] },
  { say: "In Arabic digits: ١١/١٢." },
  { say: "Eleven-twelfths. Don't tell anyone." },
  { say: "22/24, which simplifies even more." },
  { say: "It's 11 over 12." },
];
