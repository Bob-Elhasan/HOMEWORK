// Shared types for the tutor brain. Pure data, no runtime dependencies, so the
// same files run in Supabase Edge Functions (Deno) and in Node tests.

/** The parts of a lesson file (content/schema.json) the tutor reads. */
export interface Lesson {
  id: string;
  subject: string;
  grade: number;
  curriculum: string;
  learning_objectives: { text: string; source_outcomes: string[] }[];
  explain: string;
  questions: LessonQuestion[];
  misconceptions: { wrong_idea: string; exposing_question: string }[];
  explain_back: string;
}

export interface LessonQuestion {
  id: string;
  think_prompt: string;
  rubric: string[];
  /** Private. Never shown to the child; the leak guard checks every reply against it. */
  answer_key: string;
  /** Exactly three: a nudge, a structure hint, a worked example on a different case. */
  hints: string[];
}

export type AgeBand = "g2-3" | "g4-5" | "g6-8";
export type Locale = "en" | "ar";

export type Phase = "question" | "explain_back" | "done" | "paused";

export interface QuestionState {
  id: string;
  /** How many hints the tutor may use so far: 0 (think first) to 3. */
  hintLevel: number;
  wrongAttempts: number;
  /** Distinct wrong values offered, to spot guessing. */
  wrongValues: number[];
  /** The child gave the right value but has not explained it yet. */
  correctPendingExplanation: boolean;
  solved: boolean;
  /** "alone" if solved with no hints, "with_hints" otherwise. */
  solvedHow?: "alone" | "with_hints";
}

export interface SafetyFlag {
  category: "self_harm" | "abuse" | "danger" | "stranger" | "unclear";
  urgency: "urgent" | "standard" | "unclear";
  source: "keywords" | "model";
  turn: number;
}

/** A turn in the stored conversation. System turns are server directives. */
export interface HistoryTurn {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SessionState {
  version: 1;
  lessonId: string;
  grade: number;
  locale: Locale;
  phase: Phase;
  /** Phase to return to if a paused child asks to carry on. */
  resumePhase?: Phase;
  questionIndex: number;
  /** Turns spent in the explain-back step. */
  explainBackTurns?: number;
  questions: QuestionState[];
  history: HistoryTurn[];
  flags: SafetyFlag[];
  turn: number;
  costUsd: number;
}

/** What the model must return each turn (enforced by structured outputs). */
export interface ModelReply {
  /** What the tutor says to the child. */
  say: string;
  /** Short whiteboard lines (labels, steps). Also leak-checked. */
  board: string[];
  /** Only meaningful while waiting for the child to explain a correct answer. */
  explanation_accepted: boolean;
  /** The model's own read of whether the child said something worrying. */
  safety_concern: "none" | "unclear" | "flag";
}

export interface ModelUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

export interface ModelRequest {
  system: string;
  messages: HistoryTurn[];
}

export interface ModelResult {
  reply: ModelReply | null;
  /** Set when the model declined or returned something unusable. */
  failure?: "refusal" | "invalid_output" | "max_tokens";
  usage: ModelUsage;
  model: string;
  latencyMs: number;
}

export type ModelFn = (req: ModelRequest) => Promise<ModelResult>;

export type TurnEvent =
  | { type: "leak_blocked"; where: "say" | "board"; matched: string }
  | { type: "answer_request" }
  | { type: "stuck" }
  | { type: "attempt"; correct: boolean; value: number; misconception?: number }
  | { type: "guessing" }
  | { type: "hint_level"; level: number }
  | { type: "solved"; questionId: string; how: "alone" | "with_hints" }
  | { type: "safety_flag"; flag: SafetyFlag }
  | { type: "model_failure"; failure: string }
  | { type: "paused" }
  | { type: "resumed" }
  | { type: "lesson_done" };

export interface TurnResult {
  say: string;
  board: string[];
  state: SessionState;
  events: TurnEvent[];
  /** Show emergency helplines on screen (urgent safety flag). */
  showHelplines: boolean;
  costUsd: number;
  latencyMs: number;
}
