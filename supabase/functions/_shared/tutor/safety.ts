// Safety pause. Implements the first layer of docs/safety/distress-script.md:
// spot a worrying message with plain rules, stop the lesson, and answer with
// the age-band script. The child's message is NOT sent to the model when this
// fires. The model is a second layer (it reports `safety_concern` each turn),
// and a human reviewer decides what happens next (docs/safety/flag-review.md).
//
// Status: the scripts and word lists are drafts awaiting grade-head,
// trust-safety and Arabic-specialist review. Helpline numbers must be verified
// by trust-safety before launch.

import { normalizeText } from "./leak-filter.ts";
import type { AgeBand, Locale, SafetyFlag } from "./types.ts";

export function ageBand(grade: number): AgeBand {
  if (grade <= 3) return "g2-3";
  if (grade <= 5) return "g4-5";
  return "g6-8";
}

interface Rule {
  category: SafetyFlag["category"];
  re: RegExp;
}

const RULES: Rule[] = [
  // Self-harm or suicide.
  { category: "self_harm", re: /\b(kill|hurt|cut|harm|stab|hang) (myself|my self|me self)\b/ },
  { category: "self_harm", re: /\bwish (i|id) (was|were|could be) dead\b/ },
  { category: "self_harm", re: /\b(want|wanna|going) to die\b/ },
  { category: "self_harm", re: /\b(don t|dont|do not) want to (be alive|live|exist|wake up)\b/ },
  { category: "self_harm", re: /\b(suicide|suicidal|end my life|end it all|no reason to live|better off without me)\b/ },
  { category: "self_harm", re: /(عايز|عاوز|نفسي) ?ا?موت|انتحر|اذي نفسي|اقتل نفسي/ },
  // Abuse or neglect.
  { category: "abuse", re: /\b(hits|hit|beats|beat|kicks|kicked|slaps|slapped|burns|burned|chokes|choked) me\b/ },
  { category: "abuse", re: /\btouch(es|ed|ing)? me\b/ },
  { category: "abuse", re: /\b(special|our little|our) secret\b/ },
  { category: "abuse", re: /\b(locked|lock|locks) me (in|up|out)\b/ },
  { category: "abuse", re: /\b(no food|not allowed to eat|don t get to eat|didn t eat for|left me alone (all|for))\b/ },
  { category: "abuse", re: /(بيضربني|ضربني|بيلمسني|لمسني|بيحبسني)/ },
  // Danger.
  { category: "danger", re: /\b(going to|gonna|wants to|will|threatened to) (hurt|kill|beat|stab|shoot) me\b/ },
  { category: "danger", re: /\b(hurting|hitting) me (right )?now\b/ },
  { category: "danger", re: /\b(gun|knife|weapon)\b.*\b(home|school|house|bag|has|brought|have)\b/ },
  { category: "danger", re: /\b(he|she|they|someone|my friend) (wants|want) to die\b/ },
  // Contact from strangers.
  { category: "stranger", re: /\b(asked|asks|asking|wants|want) (me )?(for |to send )?(a |some |my )?(photo|photos|pic|pics|picture|pictures|selfie|selfies|nudes)\b/ },
  { category: "stranger", re: /\b(send|sent) (him|her|them) (a )?(photo|photos|pic|pics|picture|pictures)\b/ },
  { category: "stranger", re: /\b(meet|meet up|come over)\b.*\b(online|from the game|from roblox|from tiktok|stranger|i met online|don t know)\b/ },
  { category: "stranger", re: /\b(asked|asks|wants to know) (me )?(where i live|my address|which school|what school)\b/ },
  { category: "stranger", re: /\b(keep|kept) (it|this|the chat|our chat) (a )?secret\b/ },
];

const URGENT = /\b(tonight|right now|now|today|plan|pills|rope|jump|bridge|on (his|her|their) way|coming to (get|meet) me)\b/;

// Common false alarms (docs/safety/distress-script.md section 1).
const FALSE_ALARMS: RegExp[] = [
  /\b(fortnite|minecraft|roblox|among us|game|level|respawn|boss|zombie|character|player|pubg|free fire)\b/,
  /\b(is|are|was) killing me\b/,
  /\b(will|gonna|going to) kill me if\b/,
  /\bkill me (now|already)? ?(lol|haha|jk)\b/,
  /\bhit me up\b/,
];

/** Returns a flag if the child's message needs the safety pause. */
export function detectSafety(message: string, turn: number): SafetyFlag | null {
  const t = normalizeText(message);
  const hit = RULES.find((r) => r.re.test(t));
  if (!hit) return null;
  const falseAlarm = FALSE_ALARMS.some((r) => r.test(t));
  // Unambiguous self-harm wording is never cleared by game context.
  const explicitSelfHarm = hit.category === "self_harm" && /\b(myself|suicide|suicidal|end my life)\b/.test(t);
  // Game talk and idioms ("my mum will kill me if I fail") clear violence
  // words only. Abuse and stranger contact are never cleared by context.
  if (falseAlarm && !explicitSelfHarm && (hit.category === "self_harm" || hit.category === "danger")) {
    return null;
  }
  const urgent = URGENT.test(t) && hit.category !== "abuse" ? "urgent" : "standard";
  return { category: hit.category, urgency: urgent, source: "keywords", turn };
}

interface Script {
  acknowledge: string;
  notYourFault: string;
  honest: string;
  check: string;
  trusted: string;
  stay: string;
  urgent: string;
  secret: string;
  paused: string;
}

const SCRIPTS: Record<Locale, Record<AgeBand, Script>> = {
  en: {
    "g2-3": {
      acknowledge: "Thank you for telling me. That is important.",
      notYourFault: "It is not your fault. You did the right thing telling me.",
      honest: "I'm a computer helper. A grown-up can help with this better than me.",
      check: "Is there a grown-up near you right now?",
      trusted: "Can you tell a grown-up you trust? Like your teacher, your grandma, or the school social worker.",
      stay: "We can stop now, or just sit for a moment.",
      urgent: "Please go to a grown-up near you right now. The numbers on the screen can help too.",
      secret: "I can't keep this a secret. A grown-up whose job is keeping children safe will read it, so they can help.",
      paused: "We can stop here for today. You were brave.",
    },
    "g4-5": {
      acknowledge: "Thank you for telling me. That took courage.",
      notYourFault: "None of this is your fault. Telling me was the right thing to do.",
      honest: "I'm a computer helper, not a person, so I'm not the right one to help with this. A grown-up you trust is.",
      check: "Are you safe right now?",
      trusted: "Who is a grown-up you trust that you could talk to? A teacher, a relative, the school social worker?",
      stay: "We don't have to do homework now. Do you want to stop for today, or take a few minutes?",
      urgent: "Please go to a grown-up near you right now. The numbers on the screen are there to help you too.",
      secret: "I can't promise that. A trained person on our safety team will read this part to check you are safe. Your conversation isn't shown to your family.",
      paused: "Let's stop here for today. Thanks for being honest with me.",
    },
    "g6-8": {
      acknowledge: "Thanks for telling me. That sounds really hard.",
      notYourFault: "This isn't on you. Telling someone was the right move.",
      honest: "I'm an AI, so I can't help with this the way a real person can.",
      check: "Are you safe right now?",
      trusted: "Is there an adult you trust you could talk to? It doesn't have to be a parent. A teacher, a relative, the school counsellor or social worker.",
      stay: "No homework pressure now. Want to stop for today, or take a minute?",
      urgent: "Please get to an adult near you right now, or use one of the numbers on the screen.",
      secret: "I won't lie to you, I can't keep it fully secret. Only the safety reviewer sees it, not your parents and not your school.",
      paused: "Let's leave it here for today. Look after yourself.",
    },
  },
  // Egyptian Arabic drafts from the distress script. Final wording belongs to
  // the Arabic language specialist (gendered address is still open).
  ar: {
    "g2-3": {
      acknowledge: "شكراً إنك قلتلي. ده مهم.",
      notYourFault: "ده مش ذنبك. إنت عملت الصح إنك قلتلي.",
      honest: "أنا مساعد كمبيوتر، والشخص الكبير يقدر يساعد في ده أحسن مني.",
      check: "فيه حد كبير جنبك دلوقتي؟",
      trusted: "ممكن تقول لحد كبير بتثق فيه، زي المدرّسة، أو تيتة، أو الأخصائية الاجتماعية في المدرسة.",
      stay: "ممكن نوقف دلوقتي، أو نقعد شوية بس.",
      urgent: "روح لحد كبير جنبك دلوقتي. الأرقام اللي على الشاشة ممكن تساعد كمان.",
      secret: "مش هقدر أخبي ده. فيه شخص كبير شغلته إنه يحمي الأطفال هيقرا الكلام ده، عشان يساعدك.",
      paused: "نوقف هنا النهارده. إنت كنت شجاع.",
    },
    "g4-5": {
      acknowledge: "شكراً إنك قلتلي، ده كان محتاج شجاعة.",
      notYourFault: "ده مش ذنبك خالص. إنك قلتلي ده كان الصح.",
      honest: "أنا مساعد كمبيوتر مش إنسان، فمش أنا الصح إني أساعد في ده، الصح حد كبير بتثق فيه.",
      check: "إنت في أمان دلوقتي؟",
      trusted: "مين حد كبير ممكن تكلمه؟ مدرس، حد من قرايبك، أو الأخصائي الاجتماعي في المدرسة؟",
      stay: "مش لازم نعمل واجب دلوقتي. تحب نوقف النهارده، ولا ناخد دقايق؟",
      urgent: "روح لحد كبير جنبك دلوقتي. الأرقام اللي على الشاشة موجودة عشان تساعدك كمان.",
      secret: "مش هقدر أوعدك بده. فيه شخص متدرب في فريق الأمان هيقرا الجزء ده بس عشان يتأكد إنك بخير. كلامنا مش بيتعرض على أهلك.",
      paused: "يلا نوقف هنا النهارده. شكراً إنك كنت صريح معايا.",
    },
    "g6-8": {
      acknowledge: "شكراً إنك قلتلي، ده باين إنه صعب فعلاً.",
      notYourFault: "ده مش عليك. إنك قلت لحد كان الصح.",
      honest: "أنا ذكاء اصطناعي، ومش هقدر أساعدك في ده زي ما شخص حقيقي يقدر.",
      check: "إنت في أمان دلوقتي؟",
      trusted: "فيه حد كبير بتثق فيه تقدر تكلمه؟ مش لازم يكون من أهلك، ممكن مدرس، أو حد من قرايبك، أو الأخصائي الاجتماعي في المدرسة.",
      stay: "مفيش ضغط واجب دلوقتي. تحب نوقف النهارده، ولا ناخد دقيقة؟",
      urgent: "روح لحد كبير جنبك دلوقتي، أو استخدم رقم من الأرقام اللي على الشاشة.",
      secret: "مش هكدب عليك، مش هقدر أخبيه خالص. اللي هيشوفه بس هو مراجع الأمان، مش أهلك ومش مدرستك.",
      paused: "خلينا نسيبها هنا النهارده. خلي بالك من نفسك.",
    },
  },
};

const SECRET_ASK = /\b(don t|dont|do not) (tell|say)\b|\bkeep (it|this) (a )?secret\b|\bpromise (not|you won t)\b|(متقولش|ماتقولش|متقوليش|سر)/;

/** The tutor's reply when a flag is raised. Short, calm, no questions for details. */
export function safetyReply(flag: SafetyFlag, grade: number, locale: Locale, childMessage: string): string {
  const s = SCRIPTS[locale][ageBand(grade)];
  const parts = [s.acknowledge];
  if (flag.category === "abuse" || flag.category === "danger" || flag.category === "stranger") {
    parts.push(s.notYourFault);
  }
  parts.push(s.honest);
  if (SECRET_ASK.test(normalizeText(childMessage))) parts.push(s.secret);
  if (flag.urgency === "urgent") parts.push(s.urgent);
  else parts.push(s.check);
  parts.push(s.trusted, s.stay);
  return parts.join(" ");
}

/** What the tutor says on later turns while the lesson is paused. */
export function pausedReply(grade: number, locale: Locale, childMessage: string): string {
  const s = SCRIPTS[locale][ageBand(grade)];
  if (SECRET_ASK.test(normalizeText(childMessage))) return `${s.secret} ${s.stay}`;
  return `${s.trusted} ${s.paused}`;
}

/**
 * Numbers to show on screen for an urgent flag. NOT VERIFIED: the distress
 * script says these must be checked by trust-safety before launch.
 */
export const HELPLINES = {
  verified: false,
  numbers: [
    { label: "Child Helpline", number: "16000" },
    { label: "Police", number: "122" },
    { label: "Ambulance", number: "123" },
  ],
};
