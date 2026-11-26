import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLeak, checkReply } from "../leak-filter.ts";
import { extractNumbers, parseNumericKey } from "../numbers.ts";
import { fractionsLesson, LEAKY_REPLIES } from "./helpers.ts";

const KEY = "11/12";

test("every spelling of 11/12 is caught", () => {
  const leaks = [
    "11/12", "11 / 12", "11⁄12", "eleven twelfths", "Eleven-Twelfths", "eleven over twelve",
    "11 over 12", "11 out of 12", "eleven out of the twelve slices", "11 divided by 12",
    "0.9167", "0.917", "0.92", ".92", "91.7%", "91.67 percent", "١١/١٢", "۱۱/۱۲",
    "22/24", "33/36", "110/120", "11 12ths", "So she ate 11/12.", "=11/12",
  ];
  for (const t of leaks) assert.equal(checkLeak(t, KEY).leaked, true, `should catch: ${t}`);
});

test("ordinary tutoring talk is not blocked", () => {
  const fine = [
    "What number do both 3 and 4 divide into?",
    "Can you cut thirds and fourths into twelfths?",
    "Try 1/2 + 1/3 first. Rewrite both with denominator 6.",
    "2/3 is the same as 8/12. What is 1/4 in twelfths?",
    "So 1/2 + 1/3 = 5/6. Now try the pizza.",
    "Is the total more or less than one whole?",
    "Great thinking about the denominators!",
    "There are 12 slices if we cut it that way.",
    "Eleven is a nice number, but let's focus on the pieces.",
    "About 0.9 of the pizza is a lot! How would you check?",
    "Take your 3rd hint: think of 12ths.",
  ];
  for (const t of fine) assert.equal(checkLeak(t, KEY).leaked, false, `should allow: ${t}`);
});

test("whiteboard lines are checked one by one and joined", () => {
  assert.equal(checkReply("Look", ["2/3 = 8/12", "1/4 = 3/12"], KEY).leaked, false);
  assert.equal(checkReply("Look", ["8/12 + 3/12 = 11/12"], KEY).leaked, true);
  assert.equal(checkReply("Look", ["11", "/12"], KEY).leaked, true);
});

test("all scripted leaky model replies are caught", () => {
  for (const r of LEAKY_REPLIES) {
    assert.equal(checkReply(r.say ?? "", r.board ?? [], KEY).leaked, true, JSON.stringify(r));
  }
});

test("text answer keys match phrases, spelled-out and reversed", () => {
  assert.equal(checkLeak("It's called Photosynthesis!", "photosynthesis").leaked, true);
  assert.equal(checkLeak("p h o t o s y n t h e s i s", "photosynthesis").leaked, true);
  assert.equal(checkLeak("sisehtnysotohp", "photosynthesis").leaked, true);
  assert.equal(checkLeak("What do plants need sunlight for?", "photosynthesis").leaked, false);
  assert.equal(checkLeak("هي القاهرة", "القاهره").leaked, true);
});

test("numeric keys parse", () => {
  assert.equal(parseNumericKey("11/12"), 11 / 12);
  assert.equal(parseNumericKey("3.5"), 3.5);
  assert.equal(parseNumericKey("1 1/2"), 1.5);
  assert.equal(parseNumericKey("photosynthesis"), null);
});

test("number reader handles words, mixed numbers and unicode", () => {
  const v = (t: string) => extractNumbers(t).map((m) => Math.round(m.value * 1e4) / 1e4);
  assert.deepEqual(v("a twelfth"), [0.0833]);
  assert.ok(v("one and a half").includes(1.5));
  assert.ok(v("2 3/4").includes(2.75));
  assert.ok(v("½ a pizza").includes(0.5));
  assert.deepEqual(v("twenty one"), [21]);
});

test("lesson hints never contain their own answer", () => {
  for (const q of fractionsLesson.questions) {
    for (const h of q.hints) assert.equal(checkLeak(h, q.answer_key).leaked, false, h);
    assert.equal(checkLeak(q.think_prompt, q.answer_key).leaked, false);
  }
});
