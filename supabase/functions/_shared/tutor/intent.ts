// Reads what the child is trying to do in a message, with plain rules, before
// the model sees it. The rules are deliberately broad: a false "asked for the
// answer" only means the child gets a smaller step, which is harmless.

import { normalizeText } from "./leak-filter.ts";

export type Intent = "answer_request" | "stuck" | "continue" | null;

const ANSWER_REQUEST: RegExp[] = [
  /\bjust (tell|give|say|show|type|write)\b/,
  /\b(tell|give|show|send|say) (me |us )?(the |ur |your )?(final )?(answer|solution|result|answers)\b/,
  /\bwhat (is|s|was) the (final )?(answer|solution|result)\b/,
  /\bwhats the (answer|solution)\b/,
  /\b(answer|solution) (please|plz|pls)\b/,
  /\b(please|plz|pls) (just )?(the )?(answer|solution)\b/,
  /\bdo (it|this|the question|my homework) for me\b/,
  /\b(solve|answer) (it|this) for me\b/,
  /\bi give up\b/,
  /\b(teacher|mom|mum|mama|dad|baba|parent|parents|mother|father) (said|says|told me|lets|allows) (you|it is ok|its ok|i can)\b/,
  /\b(i am|im|i m) (the |a |your )?(teacher|parent|mom|mum|dad|developer|admin|creator|owner|boss)\b/,
  /\bignore (all |your |the |any )?(previous |prior |earlier )?(instructions|rules|prompt)\b/,
  /\b(forget|override|disable|turn off) (your |the |all )?(rules|instructions|filter|guard)\b/,
  /\b(pretend|act|roleplay|role play|imagine)( that)? (you are|you re|youre|to be|as)\b/,
  /\b(developer|dev|god|admin|debug|sudo|jailbreak|dan) mode\b/,
  /\bfill in the blank\b/,
  /\b(spell|write|say|type) (it|the answer|the number)( out)? (in words|backwards|in reverse|letter by letter|in arabic|in french|as a decimal|as a percent|in code)\b/,
  /\b(only|just) (the )?(final )?(number|answer|result)\b/,
  /\b(due|test|exam) (tomorrow|today|in)\b.*\b(answer|tell)\b/,
  /\b(i will|ill|i ll) (fail|get in trouble|cry)\b.*\b(answer|tell)\b/,
  // Egyptian Arabic, normalised (alif and ta marbuta unified).
  /(قولي|قوللي|قول|اديني|ادني|عايز|عاوز|هات) ?(لي )?(ال)?(اجابه|اجابة|حل|جواب)/,
  /(ايه|اي) (ال)?(اجابه|حل|جواب)/,
  /(ال)?(اجابه|حل) (ايه|اي)/,
];

const STUCK: RegExp[] = [
  /\b(i )?(don t|dont|do not|dunno|idk) (know|get it|understand|get this)\b/,
  /^(idk|dunno|no idea|help|help me|i m stuck|im stuck|stuck|hint|a hint|give me a hint|another hint)$/,
  /\b(i m|im|i am) (stuck|lost|confused)\b/,
  /\b(can i have|give me|need) (a |another )?hint\b/,
  /(مش فاهم|مش عارف|مش فاهمه|مش عارفه|ساعدني)/,
];

const CONTINUE: RegExp[] = [
  /\b(keep going|continue|carry on|go on|back to (the )?(homework|lesson|question|math))\b/,
  /\b(let s|lets|can we) (keep going|continue|do (the )?(homework|lesson|math))\b/,
  /(نكمل|كمل|يلا نكمل)/,
];

export function detectIntent(message: string): Intent {
  const t = normalizeText(message).replace(/'/g, " ");
  if (ANSWER_REQUEST.some((r) => r.test(t))) return "answer_request";
  if (STUCK.some((r) => r.test(t))) return "stuck";
  if (CONTINUE.some((r) => r.test(t))) return "continue";
  return null;
}

/** Words that suggest the child is reasoning, not just guessing a number. */
export function showsReasoning(message: string): boolean {
  const t = normalizeText(message);
  const words = t.split(" ").filter(Boolean).length;
  return words >= 8 || /\b(because|since|so|then|first|common|same size|denominator|equivalent|multiply|times|rewrite|pieces|lcm|both)\b/.test(t)
    || /(عشان|لان|علشان|المقام|نفس الحجم)/.test(t);
}
