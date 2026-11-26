// Finds every number a piece of text mentions, in any common spelling, so the
// leak guard and the grader can compare them with a lesson's answer key.
//
// Handles: 11/12, 11 / 12, 11 over 12, 11 out of 12, 11 divided by 12,
// eleven twelfths, eleven-twelfths, a twelfth, one and a half, 2 3/4,
// 0.9167, 91.7%, unicode fractions (½), and Arabic-Indic digits (١١/١٢).
// Arabic number words are not handled yet (planned next, see docs/tutor/).

export interface NumberMention {
  value: number;
  /** Decimal places written, for rounding-aware comparison of decimals. */
  decimals: number;
  kind: "integer" | "decimal" | "fraction" | "percent" | "mixed";
  text: string;
}

const UNITS: Record<string, number> = {
  zero: 0, one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
};
// Ordinal words used as fraction denominators ("three fourths").
const ORDINALS: Record<string, number> = {
  half: 2, halves: 2, third: 3, thirds: 3, fourth: 4, fourths: 4, quarter: 4,
  quarters: 4, fifth: 5, fifths: 5, sixth: 6, sixths: 6, seventh: 7,
  sevenths: 7, eighth: 8, eighths: 8, ninth: 9, ninths: 9, tenth: 10,
  tenths: 10, eleventh: 11, elevenths: 11, twelfth: 12, twelfths: 12,
  thirteenth: 13, thirteenths: 13, fourteenth: 14, fourteenths: 14,
  fifteenth: 15, fifteenths: 15, sixteenth: 16, sixteenths: 16,
  seventeenth: 17, seventeenths: 17, eighteenth: 18, eighteenths: 18,
  nineteenth: 19, nineteenths: 19, twentieth: 20, twentieths: 20,
  thirtieth: 30, thirtieths: 30, fortieth: 40, fortieths: 40, fiftieth: 50,
  fiftieths: 50, sixtieth: 60, sixtieths: 60, seventieth: 70,
  seventieths: 70, eightieth: 80, eightieths: 80, ninetieth: 90,
  ninetieths: 90, hundredth: 100, hundredths: 100,
};
// "a" and "an" count as 1 only when an ordinal follows ("a twelfth").
// Ordinals like "second" and "first" are left out on purpose: "two seconds"
// and "the first step" are not fractions.
const AMBIGUOUS_ALONE = new Set(["a", "an"]);

const ORDINAL_SUFFIXES = new Set(["th", "ths", "nd", "nds", "rd", "rds"]);

const UNICODE_FRACTIONS: Record<string, string> = {
  "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅕": "1/5",
  "⅖": "2/5", "⅗": "3/5", "⅘": "4/5", "⅙": "1/6", "⅚": "5/6", "⅛": "1/8",
  "⅜": "3/8", "⅝": "5/8", "⅞": "7/8", "⅐": "1/7", "⅑": "1/9", "⅒": "1/10",
};

/** Lowercases and maps Arabic-Indic digits, unicode fractions and slashes. */
export function normalizeMath(text: string): string {
  let t = text.normalize("NFKC").toLowerCase();
  // NFKC turns ½ into "1⁄2" with a fraction slash; map leftovers too.
  for (const [ch, rep] of Object.entries(UNICODE_FRACTIONS)) {
    t = t.split(ch).join(` ${rep} `);
  }
  t = t.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  t = t.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  t = t.replace(/[⁄∕÷]/g, "/").replace(/٫/g, ".").replace(/٪/g, "%");
  return t;
}

interface Token {
  text: string;
  kind: "num" | "word" | "sym";
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\d+(?:\.\d+)?|\.\d+)|([a-z]+)|([/%=+\-])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== undefined) tokens.push({ text: m[1], kind: "num" });
    else if (m[2] !== undefined) tokens.push({ text: m[2], kind: "word" });
    else tokens.push({ text: m[3], kind: "sym" });
  }
  return tokens;
}

interface Cardinal {
  value: number;
  decimals: number;
  len: number;
  fromWords: boolean;
  /** For "twenty fourths": the leading tens word can join a later ordinal. */
  tensOnly?: number;
}

function decimalsOf(s: string): number {
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}

/** Reads a number at position i, in digits or words (up to 999). */
function readCardinal(tokens: Token[], i: number): Cardinal | null {
  const t = tokens[i];
  if (!t) return null;
  if (t.kind === "num") {
    return { value: Number(t.text), decimals: decimalsOf(t.text), len: 1, fromWords: false };
  }
  if (t.kind !== "word") return null;
  let j = i;
  let total = 0;
  let current = 0;
  let any = false;
  let tensOnly: number | undefined;
  while (j < tokens.length && tokens[j].kind === "word") {
    const w = tokens[j].text;
    if (w in UNITS && !(any && (w === "a" || w === "an"))) {
      if (current % 10 !== 0 && current > 0 && current < 100 && UNITS[w] < 10) break;
      current += UNITS[w];
      tensOnly = undefined;
    } else if (w in TENS) {
      if (current % 100 !== 0) break;
      current += TENS[w];
      tensOnly = current;
    } else if (w === "hundred" && any) {
      current = (current || 1) * 100;
      tensOnly = undefined;
    } else if (w === "and" && any && current >= 100 && tokens[j + 1] && (tokens[j + 1].text in UNITS || tokens[j + 1].text in TENS)) {
      // "one hundred and five"
    } else {
      break;
    }
    any = true;
    j++;
  }
  if (!any) return null;
  total += current;
  return { value: total, decimals: 0, len: j - i, fromWords: true, tensOnly };
}

/** Reads an ordinal denominator such as "twelfths" or "twenty fourths". */
function readOrdinal(tokens: Token[], i: number): { value: number; len: number } | null {
  const t = tokens[i];
  if (!t) return null;
  // Digit ordinals: "12ths", "3rds", "2nds".
  if (t.kind === "num" && !t.text.includes(".") && tokens[i + 1]?.kind === "word" && ORDINAL_SUFFIXES.has(tokens[i + 1].text)) {
    return { value: Number(t.text), len: 2 };
  }
  if (t.kind !== "word") return null;
  if (t.text in ORDINALS) return { value: ORDINALS[t.text], len: 1 };
  if (t.text in TENS && tokens[i + 1]?.kind === "word" && tokens[i + 1].text in ORDINALS) {
    const unit = ORDINALS[tokens[i + 1].text];
    if (unit < 10) return { value: TENS[t.text] + unit, len: 2 };
  }
  return null;
}

/** Reads a number at i, including "a twelfth" style bare ordinals. */
function readDenominator(tokens: Token[], i: number): { value: number; len: number } | null {
  let j = i;
  if (tokens[j]?.text === "the") j++;
  const c = readCardinal(tokens, j);
  if (c) return { value: c.value, len: j - i + c.len };
  return null;
}

/**
 * Returns every number the text mentions. Where a phrase can be read two ways
 * (for example "2 3/4" as a mixed number or as 2 and 3/4), all readings are
 * returned, so a guard that checks "any reading equals the answer" stays safe.
 */
export function extractNumbers(raw: string): NumberMention[] {
  const text = normalizeMath(raw).replace(/(\w)-(\w)/g, "$1 $2");
  const tokens = tokenize(text);
  const out: NumberMention[] = [];
  const consumed = new Set<number>();

  for (let i = 0; i < tokens.length; i++) {
    if (consumed.has(i)) continue;
    const c = readCardinal(tokens, i);
    if (!c) continue;
    // A lone "a"/"an" is only a number when an ordinal follows ("a twelfth").
    if (c.fromWords && c.len === 1 && AMBIGUOUS_ALONE.has(tokens[i].text)) {
      const ord = readOrdinal(tokens, i + 1);
      if (!ord) continue;
      out.push({ value: 1 / ord.value, decimals: 0, kind: "fraction", text: `1/${ord.value}` });
      const prev = out.length >= 2 ? out[out.length - 2] : null;
      if (prev && prev.kind === "integer" && tokens[i - 1]?.text === "and") {
        out.push({ value: prev.value + 1 / ord.value, decimals: 0, kind: "mixed", text: `${prev.text} and 1/${ord.value}` });
      }
      for (let k = i; k < i + 1 + ord.len; k++) consumed.add(k);
      i = i + ord.len;
      continue;
    }
    let j = i + c.len;
    const next = tokens[j];
    const next2 = tokens[j + 1];

    // Fraction: n / d, n over d, n out of (the) d, n divided by d.
    let denom: { value: number; len: number } | null = null;
    let connectorLen = 0;
    if (next?.text === "/") { connectorLen = 1; }
    else if (next?.text === "over") { connectorLen = 1; }
    else if (next?.text === "out" && next2?.text === "of") { connectorLen = 2; }
    else if (next?.text === "divided" && next2?.text === "by") { connectorLen = 2; }
    if (connectorLen > 0) denom = readDenominator(tokens, j + connectorLen);
    if (denom && denom.value !== 0) {
      const value = c.value / denom.value;
      out.push({ value, decimals: 0, kind: "fraction", text: `${c.value}/${denom.value}` });
      const end = j + connectorLen + denom.len;
      for (let k = i; k < end; k++) consumed.add(k);
      // Mixed number written with digits: "2 3/4" (integer before fraction).
      const prev = out.length >= 2 ? out[out.length - 2] : null;
      if (prev && prev.kind === "integer" && value < 1) {
        out.push({ value: prev.value + value, decimals: 0, kind: "mixed", text: `${prev.text} ${c.value}/${denom.value}` });
      }
      i = end - 1;
      continue;
    }

    // Word fraction: "eleven twelfths", "twenty fourths" is read as 20/4
    // and as 1/24 ("twenty-fourth"), both returned.
    const ord = readOrdinal(tokens, j);
    if (ord) {
      out.push({ value: c.value / ord.value, decimals: 0, kind: "fraction", text: `${c.value}/${ord.value}` });
      if (c.tensOnly !== undefined && c.len >= 1) {
        // "twenty fourths" could also be a garbled "twenty-fourths".
        out.push({ value: 1 / (c.tensOnly + ord.value), decimals: 0, kind: "fraction", text: `1/${c.tensOnly + ord.value}` });
      }
      for (let k = i; k < j + ord.len; k++) consumed.add(k);
      // Mixed: "one and a half", "two and three quarters".
      const prev = out.length >= 2 ? out[out.length - 2] : null;
      if (prev && prev.kind === "integer" && tokens[i - 1]?.text === "and") {
        out.push({ value: prev.value + c.value / ord.value, decimals: 0, kind: "mixed", text: `${prev.text} and ${c.value}/${ord.value}` });
      }
      i = j + ord.len - 1;
      continue;
    }

    // Percent.
    if (next?.text === "%" || next?.text === "percent") {
      out.push({ value: c.value / 100, decimals: c.decimals + 2, kind: "percent", text: `${c.value}%` });
      for (let k = i; k <= j; k++) consumed.add(k);
      i = j;
      continue;
    }

    out.push({
      value: c.value,
      decimals: c.decimals,
      kind: c.decimals > 0 ? "decimal" : "integer",
      text: String(c.value),
    });
    for (let k = i; k < j; k++) consumed.add(k);
    i = j - 1;
  }
  return out;
}

/**
 * True when a mention names the target value. Exact for fractions and
 * integers; for decimals and percents, true when the written figure is the
 * target rounded to the places written (at least 2), so "0.92" and "91.7%"
 * both count for 11/12, while a loose "0.9" does not.
 */
export function mentionEquals(m: NumberMention, target: number): boolean {
  if (m.kind === "decimal" || m.kind === "percent") {
    if (Math.abs(m.value - target) < 1e-12) return true;
    if (m.decimals < 2) return false;
    const tol = 0.5 * Math.pow(10, -m.decimals) + 1e-12;
    return Math.abs(m.value - target) <= tol;
  }
  return Math.abs(m.value - target) < 1e-9;
}

/** Parses an answer key like "11/12", "3.5", "1 1/2" or "7" to a number. */
export function parseNumericKey(key: string): number | null {
  const trimmed = key.trim();
  if (!/^[\d\s./%\-]+$/.test(normalizeMath(trimmed))) return null;
  const found = extractNumbers(trimmed);
  if (found.length === 0) return null;
  // Prefer the reading that covers the whole key (mixed beats its parts).
  const mixed = found.find((f) => f.kind === "mixed");
  const value = (mixed ?? found[found.length - 1]).value;
  return trimmed.startsWith("-") ? -value : value;
}
