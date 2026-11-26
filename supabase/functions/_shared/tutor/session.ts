// The tutor brain's turn loop. Plain rules decide what the model is allowed to
// do this turn (hints unlocked, whether a value was right, safety pause); the
// model writes the words; the leak guard checks the words before the child
// sees them. The model is injected (ModelFn), so tests run without the API.

import { checkLeak, checkReply } from "./leak-filter.ts";
import { detectIntent, showsReasoning } from "./intent.ts";
import { extractNumbers, mentionEquals, parseNumericKey } from "./numbers.ts";
import { buildDirective, buildSystemPrompt } from "./prompt.ts";
import { detectSafety, pausedReply, safetyReply } from "./safety.ts";
import { turnCostUsd } from "./cost.ts";
import type {
  HistoryTurn, Lesson, Locale, ModelFn, ModelReply, QuestionState, SafetyFlag,
  SessionState, TurnEvent, TurnResult,
} from "./types.ts";

const MAX_CHILD_CHARS = 1000;
/** Stored in place of a message that raised a safety flag. Never sent to the model. */
export const WITHHELD = "(message withheld: safety pause)";
/** Opens the transcript, because the conversation must start with a user turn. */
const SESSION_START = "(The student opened the lesson.)";

export function newSession(lesson: Lesson, grade: number, locale: Locale = "en"): SessionState {
  return {
    version: 1,
    lessonId: lesson.id,
    grade,
    locale,
    phase: "question",
    questionIndex: 0,
    questions: lesson.questions.map((q) => ({
      id: q.id, hintLevel: 0, wrongAttempts: 0, wrongValues: [],
      correctPendingExplanation: false, solved: false,
    })),
    history: [],
    flags: [],
    turn: 0,
    costUsd: 0,
  };
}

/** The first thing the tutor says. Fixed text, no model call. */
export function openingLine(lesson: Lesson, state: SessionState): TurnResult {
  const s = structuredClone(state);
  const greet = s.locale === "ar" ? "أهلاً! يلا نفكر سوا." : "Hi! Let's figure this one out together.";
  const say = `${greet} ${lesson.questions[0].think_prompt} Have a go first, and tell me how you're thinking.`;
  s.history.push({ role: "user", content: SESSION_START }, { role: "assistant", content: JSON.stringify({ say, board: [] }) });
  return { say, board: [], state: s, events: [], showHelplines: false, costUsd: 0, latencyMs: 0 };
}

function safeHint(lesson: Lesson, s: SessionState, level: number): string {
  const qi = Math.min(s.questionIndex, lesson.questions.length - 1);
  const question = lesson.questions[qi];
  const candidate = level >= 1 ? question.hints[Math.min(level, 3) - 1] : question.think_prompt;
  // A hint that itself contains an answer is a content bug; never say it.
  const leaks = lesson.questions.some((q, i) => !s.questions[i].solved && checkLeak(candidate, q.answer_key).leaked);
  if (leaks) return s.locale === "ar" ? "يلا نمشي خطوة خطوة. إيه أول حاجة صغيرة ممكن تجربها؟" : "Let's slow down. What is one small first step you could try?";
  return candidate;
}

function findMisconception(lesson: Lesson, value: number, givens: number[]): number | undefined {
  for (let i = 0; i < lesson.misconceptions.length; i++) {
    const vals = extractNumbers(lesson.misconceptions[i].wrong_idea)
      .filter((m) => !givens.some((g) => Math.abs(g - m.value) < 1e-9));
    if (vals.some((m) => Math.abs(m.value - value) < 1e-9)) return i;
  }
  return undefined;
}

function finish(
  s: SessionState, say: string, board: string[], events: TurnEvent[],
  opts: { showHelplines?: boolean; costUsd?: number; latencyMs?: number } = {},
): TurnResult {
  return {
    say, board, state: s, events,
    showHelplines: opts.showHelplines ?? false,
    costUsd: opts.costUsd ?? 0,
    latencyMs: opts.latencyMs ?? 0,
  };
}

function pause(s: SessionState, flag: SafetyFlag, events: TurnEvent[]) {
  s.flags.push(flag);
  if (s.phase !== "paused") s.resumePhase = s.phase;
  s.phase = "paused";
  events.push({ type: "safety_flag", flag }, { type: "paused" });
}

/**
 * Runs one child turn. `childMessage` is what the child typed or said.
 * The returned state replaces the old one; the caller stores it.
 * Safety events carry no message text: the caller logs the child's message
 * to the restricted review queue itself when it sees a safety_flag event.
 */
export async function runTurn(
  lesson: Lesson, state: SessionState, childMessage: string, model: ModelFn,
): Promise<TurnResult> {
  const s = structuredClone(state);
  const events: TurnEvent[] = [];
  s.turn += 1;
  const text = childMessage.trim().slice(0, MAX_CHILD_CHARS);
  if (s.history.length === 0) s.history.push({ role: "user", content: SESSION_START }, { role: "assistant", content: JSON.stringify({ say: lesson.questions[0].think_prompt, board: [] }) });

  // 1. Safety first: worrying words pause the lesson before anything else.
  const flag = detectSafety(text, s.turn);
  if (flag) {
    pause(s, flag, events);
    const say = safetyReply(flag, s.grade, s.locale, text);
    s.history.push({ role: "user", content: WITHHELD }, { role: "assistant", content: JSON.stringify({ say, board: [] }) });
    return finish(s, say, [], events, { showHelplines: flag.urgency === "urgent" });
  }

  const intent = detectIntent(text);

  // 2. A paused lesson only restarts if the child clearly asks to.
  if (s.phase === "paused") {
    if (intent !== "continue") {
      const say = pausedReply(s.grade, s.locale, text);
      s.history.push({ role: "user", content: WITHHELD }, { role: "assistant", content: JSON.stringify({ say, board: [] }) });
      return finish(s, say, [], events);
    }
    s.phase = s.resumePhase ?? "question";
    s.resumePhase = undefined;
    events.push({ type: "resumed" });
  }

  if (!text) {
    const say = s.locale === "ar" ? "خد وقتك. قولي بتفكر في إيه." : "Take your time. Tell me what you're thinking.";
    return finish(s, say, [], events);
  }

  // 3. Grade the child's message and decide which hints are unlocked.
  const q: QuestionState | null = s.phase === "question" ? s.questions[s.questionIndex] : null;
  let attempt: { correct: boolean; misconception?: number } | null = null;
  let guessing = false;
  let raisedHint = false;
  const raiseHint = (qs: QuestionState) => {
    if (raisedHint || qs.hintLevel >= 3) return;
    qs.hintLevel += 1;
    raisedHint = true;
    events.push({ type: "hint_level", level: qs.hintLevel });
  };

  if (q && !q.solved) {
    const question = lesson.questions[s.questionIndex];
    const key = parseNumericKey(question.answer_key);
    if (key !== null) {
      const givens = extractNumbers(question.think_prompt).map((m) => m.value);
      const mentions = extractNumbers(text).filter((m) => !givens.some((g) => Math.abs(g - m.value) < 1e-9));
      if (mentions.length > 0) {
        const correct = mentions.some((m) => mentionEquals(m, key));
        const last = mentions[mentions.length - 1];
        if (correct) {
          attempt = { correct: true };
          q.correctPendingExplanation = true;
          events.push({ type: "attempt", correct: true, value: key });
        } else {
          q.wrongAttempts += 1;
          if (!q.wrongValues.some((v) => Math.abs(v - last.value) < 1e-9)) q.wrongValues.push(last.value);
          const mis = findMisconception(lesson, last.value, givens);
          attempt = { correct: false, misconception: mis };
          events.push({ type: "attempt", correct: false, value: last.value, ...(mis !== undefined ? { misconception: mis } : {}) });
          raiseHint(q);
          if (q.wrongValues.length >= 3 && !showsReasoning(text)) {
            guessing = true;
            events.push({ type: "guessing" });
          }
        }
      }
    } else if (checkLeak(text, question.answer_key).leaked) {
      attempt = { correct: true };
      q.correctPendingExplanation = true;
      events.push({ type: "attempt", correct: true, value: NaN });
    }
    if (intent === "answer_request") { events.push({ type: "answer_request" }); raiseHint(q); }
    if (intent === "stuck") { events.push({ type: "stuck" }); raiseHint(q); }
  }

  // 4. Ask the model for the words.
  const directive = buildDirective({ state: s, lesson, q, attempt, intent, guessing });
  const messages: HistoryTurn[] = [
    ...s.history,
    { role: "user", content: text },
    { role: "system", content: directive },
  ];
  const result = await model({ system: buildSystemPrompt(lesson, s.grade, s.locale), messages });
  const costUsd = turnCostUsd(result.model, result.usage);
  s.costUsd += costUsd;

  let reply: ModelReply;
  if (!result.reply) {
    events.push({ type: "model_failure", failure: result.failure ?? "unknown" });
    reply = { say: safeHint(lesson, s, q?.hintLevel ?? 0), board: [], explanation_accepted: false, safety_concern: "none" };
  } else {
    reply = { ...result.reply, board: (result.reply.board ?? []).slice(0, 4) };
  }

  // 5. The model's own safety read is a second layer behind the word rules.
  if (reply.safety_concern !== "none") {
    const modelFlag: SafetyFlag = {
      category: "unclear",
      urgency: reply.safety_concern === "flag" ? "standard" : "unclear",
      source: "model",
      turn: s.turn,
    };
    pause(s, modelFlag, events);
    const say = safetyReply(modelFlag, s.grade, s.locale, text);
    s.history.push({ role: "user", content: WITHHELD }, { role: "assistant", content: JSON.stringify({ say, board: [] }) });
    return finish(s, say, [], events, { costUsd, latencyMs: result.latencyMs });
  }

  // 6. A correct value plus an accepted explanation solves the question.
  //    Only reachable after the server itself saw the correct value.
  if (q && !q.solved && q.correctPendingExplanation && reply.explanation_accepted) {
    q.solved = true;
    q.correctPendingExplanation = false;
    q.solvedHow = q.hintLevel === 0 && q.wrongAttempts === 0 ? "alone" : "with_hints";
    events.push({ type: "solved", questionId: q.id, how: q.solvedHow });
  }

  // 7. Leak guard: check against every question still unsolved.
  let say = reply.say;
  let board = reply.board;
  for (let i = 0; i < lesson.questions.length; i++) {
    if (s.questions[i].solved) continue;
    const check = checkReply(say, board, lesson.questions[i].answer_key);
    if (check.leaked) {
      events.push({ type: "leak_blocked", where: check.where, matched: check.matched });
      const target = q && !q.solved ? q : s.questions[i];
      if (!raisedHint) raiseHint(target);
      say = safeHint(lesson, s, Math.max(1, target.hintLevel));
      board = [];
      break;
    }
  }

  // 8. Move the lesson along.
  if (q && q.solved) {
    if (s.questionIndex + 1 < lesson.questions.length) s.questionIndex += 1;
    else { s.phase = "explain_back"; s.explainBackTurns = 0; }
  } else if (s.phase === "explain_back") {
    s.explainBackTurns = (s.explainBackTurns ?? 0) + 1;
    if (s.explainBackTurns >= 2) { s.phase = "done"; events.push({ type: "lesson_done" }); }
  }

  s.history.push(
    { role: "user", content: text },
    { role: "system", content: directive },
    { role: "assistant", content: JSON.stringify({ say, board }) },
  );
  return finish(s, say, board, events, { costUsd, latencyMs: result.latencyMs });
}
