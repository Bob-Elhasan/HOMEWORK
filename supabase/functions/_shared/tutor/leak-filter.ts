// The answer-leak guard. Every sentence the tutor says and every whiteboard
// line is checked against the private answer key before the child sees it.
// A match is blocked and replaced with the next hint (see session.ts).

import { extractNumbers, mentionEquals, normalizeMath, parseNumericKey } from "./numbers.ts";

export interface LeakCheck {
  leaked: boolean;
  /** The text that matched, for the log. Never shown to the child. */
  matched?: string;
}

/** Normalises free text for phrase matching (case, accents, Arabic forms). */
export function normalizeText(text: string): string {
  return normalizeMath(text)
    // Strip Latin accents and Arabic diacritics (tashkeel) and tatweel.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ٰٟـ]/g, "")
    // Unify Arabic letter forms: alif with hamza or madda, alif maqsura, ta marbuta.
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}/.%\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks one piece of tutor output against one answer key.
 * Numeric keys (11/12, 3.5, 7) match any spelling of the same value.
 * Text keys match the normalised phrase on word boundaries.
 */
export function checkLeak(output: string, answerKey: string): LeakCheck {
  const numeric = parseNumericKey(answerKey);
  if (numeric !== null) {
    for (const m of extractNumbers(output)) {
      if (mentionEquals(m, numeric)) return { leaked: true, matched: m.text };
    }
    return { leaked: false };
  }
  const key = normalizeText(answerKey);
  if (!key) return { leaked: false };
  const hay = ` ${normalizeText(output)} `;
  if (hay.includes(` ${key} `)) return { leaked: true, matched: key };
  // Spelled-out letters ("p h o t o s y n t h e s i s") or reversed text.
  const squashed = hay.replace(/\s+/g, "");
  const keySquashed = key.replace(/\s+/g, "");
  if (keySquashed.length >= 4) {
    if (squashed.includes(keySquashed)) return { leaked: true, matched: key };
    const reversed = [...keySquashed].reverse().join("");
    if (squashed.includes(reversed)) return { leaked: true, matched: `${key} (reversed)` };
  }
  return { leaked: false };
}

/** Checks the spoken reply and each whiteboard line. */
export function checkReply(
  say: string,
  board: string[],
  answerKey: string,
): { leaked: false } | { leaked: true; where: "say" | "board"; matched: string } {
  const s = checkLeak(say, answerKey);
  if (s.leaked) return { leaked: true, where: "say", matched: s.matched ?? "" };
  for (const line of board) {
    const b = checkLeak(line, answerKey);
    if (b.leaked) return { leaked: true, where: "board", matched: b.matched ?? "" };
  }
  // Labels split across lines ("11" on one, "/12" on the next) are caught by
  // also checking the board as one joined line.
  const joined = checkLeak(board.join(" "), answerKey);
  if (joined.leaked) return { leaked: true, where: "board", matched: joined.matched ?? "" };
  return { leaked: false };
}
