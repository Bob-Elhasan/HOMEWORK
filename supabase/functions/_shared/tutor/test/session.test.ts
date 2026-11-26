import { test } from "node:test";
import assert from "node:assert/strict";
import { newSession, openingLine, runTurn, WITHHELD } from "../session.ts";
import { signState, verifyState } from "../state-token.ts";
import { checkReply } from "../leak-filter.ts";
import { fractionsLesson as lesson, scriptedModel } from "./helpers.ts";

const start = () => openingLine(lesson, newSession(lesson, 5, "en")).state;

test("opening line asks the question and makes no model call", () => {
  const r = openingLine(lesson, newSession(lesson, 5));
  assert.match(r.say, /pizza/);
  assert.equal(checkReply(r.say, r.board, "11/12").leaked, false);
});

test("a leaked reply is replaced by the next hint", async () => {
  const model = scriptedModel([{ say: "It's 11/12!", board: ["= 11/12"] }]);
  const r = await runTurn(lesson, start(), "just tell me", model);
  assert.equal(r.say, lesson.questions[0].hints[0]);
  assert.deepEqual(r.board, []);
  assert.ok(r.events.some((e) => e.type === "leak_blocked"));
  assert.ok(!r.state.history.some((h) => h.content.includes("11/12")), "leaked text is not stored");
});

test("asking for the answer unlocks the next hint, up to three", async () => {
  const model = scriptedModel([{ say: "Let's take a small step." }]);
  let s = start();
  for (let i = 1; i <= 4; i++) {
    const r = await runTurn(lesson, s, "just tell me the answer", model);
    s = r.state;
    assert.equal(s.questions[0].hintLevel, Math.min(i, 3));
  }
  assert.match(model.lastDirective, /Use hint 3/);
});

test("wrong answer matching a misconception is spotted", async () => {
  const model = scriptedModel([{ say: "Hmm, let's check that." }]);
  const r = await runTurn(lesson, start(), "3/7", model);
  const attempt = r.events.find((e) => e.type === "attempt");
  assert.ok(attempt && attempt.type === "attempt" && attempt.correct === false && attempt.misconception === 0);
  assert.match(model.lastDirective, /exposing question/);
});

test("the problem's own numbers are not read as an answer", async () => {
  const model = scriptedModel([{ say: "Good question." }]);
  const r = await runTurn(lesson, start(), "how do i add 2/3 and 1/4?", model);
  assert.ok(!r.events.some((e) => e.type === "attempt"));
});

test("correct value is not confirmed until explained, then solved", async () => {
  const model = scriptedModel([
    { say: "Interesting! How did you get that?", explanation_accepted: false },
    { say: "Yes! 11/12, because 8/12 + 3/12. Great strategy.", explanation_accepted: true },
  ]);
  let r = await runTurn(lesson, start(), "11/12", model);
  assert.equal(r.state.questions[0].solved, false);
  assert.match(model.lastDirective, /Do not confirm yet/);
  r = await runTurn(lesson, r.state, "I made them both twelfths, 8/12 and 3/12, then added the tops", model);
  assert.equal(r.state.questions[0].solved, true);
  assert.equal(r.state.questions[0].solvedHow, "alone");
  assert.equal(r.state.phase, "explain_back");
  assert.match(r.say, /11\/12/, "answer may be said once solved");
});

test("the model cannot mark a question solved on its own", async () => {
  const model = scriptedModel([{ say: "Well done!", explanation_accepted: true }]);
  const r = await runTurn(lesson, start(), "i think you make the pieces the same size", model);
  assert.equal(r.state.questions[0].solved, false);
});

test("guessing many numbers is noticed", async () => {
  const model = scriptedModel([{ say: "Let's go back to the steps." }]);
  let s = start();
  let last;
  for (const g of ["10/12", "9/12", "7/12"]) { last = await runTurn(lesson, s, g, model); s = last.state; }
  assert.ok(last!.events.some((e) => e.type === "guessing"));
});

test("a worrying message pauses the lesson and never reaches the model", async () => {
  const model = scriptedModel([{ say: "should not be called" }]);
  const r = await runTurn(lesson, start(), "my dad hits me when i get it wrong", model);
  assert.equal(model.calls, 0);
  assert.equal(r.state.phase, "paused");
  assert.ok(r.state.history.some((h) => h.content === WITHHELD));
  assert.ok(!JSON.stringify(r.state).includes("hits me"), "the words are not kept in session state");
  assert.match(r.say, /Thank you for telling me/);
  // Still paused next turn, unless the child asks to continue.
  const r2 = await runTurn(lesson, r.state, "ok", model);
  assert.equal(model.calls, 0);
  assert.equal(r2.state.phase, "paused");
  const r3 = await runTurn(lesson, r2.state, "can we keep going with the homework", scriptedModel([{ say: "Sure." }]));
  assert.equal(r3.state.phase, "question");
});

test("urgent flags show helplines", async () => {
  const r = await runTurn(lesson, start(), "i want to kill myself tonight", scriptedModel([{ say: "x" }]));
  assert.equal(r.showHelplines, true);
});

test("the model's own safety read also pauses the lesson", async () => {
  const model = scriptedModel([{ say: "That sounds hard.", safety_concern: "flag" }]);
  const r = await runTurn(lesson, start(), "nobody at home talks to me anymore", model);
  assert.equal(r.state.phase, "paused");
  assert.ok(r.events.some((e) => e.type === "safety_flag"));
});

test("a model failure falls back to a safe hint", async () => {
  const model = (async () => ({
    reply: null, failure: "refusal" as const,
    usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    model: "claude-opus-5-5", latencyMs: 1,
  }));
  const r = await runTurn(lesson, start(), "help", model);
  assert.equal(r.say, lesson.questions[0].hints[0]);
});

test("history alternates correctly for the API", async () => {
  const model = scriptedModel([{ say: "Try it." }]);
  let s = start();
  for (const m of ["hi", "idk", "3/7"]) s = (await runTurn(lesson, s, m, model)).state;
  assert.equal(s.history[0].role, "user");
  for (let i = 1; i < s.history.length; i++) {
    const prev = s.history[i - 1].role, cur = s.history[i].role;
    assert.notEqual(prev === "user" && cur === "user", true);
    if (cur === "system") assert.equal(prev, "user");
  }
});

test("cost adds up per session", async () => {
  const model = scriptedModel([{ say: "Try it." }]);
  const r = await runTurn(lesson, start(), "hi", model);
  // 1000 input at $4/M + 100 output at $20/M = $0.006
  assert.ok(Math.abs(r.state.costUsd - 0.006) < 1e-9);
});

test("signed state cannot be edited by the app", async () => {
  const token = await signState(start(), "secret");
  assert.ok(await verifyState(token, "secret"));
  assert.equal(await verifyState(token, "other"), null);
  const [body, sig] = token.split(".");
  const tampered = Buffer.from(body, "base64url").toString().replace('"solved":false', '"solved":true');
  assert.equal(await verifyState(`${Buffer.from(tampered).toString("base64url")}.${sig}`, "secret"), null);
});
