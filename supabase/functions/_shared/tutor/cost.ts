// Cost per turn from the API's token counts. List prices in USD per million
// tokens (Anthropic price list, November 2026). Cache writes are billed at
// 1.25x input, cache reads as listed. Haiku cache prices are assumed at the
// usual 0.1x / 1.25x ratios; check the price page before relying on them.

import type { ModelUsage } from "./types.ts";

interface Price { input: number; output: number; cacheRead: number; cacheWrite: number }

export const PRICES: Record<string, Price> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-opus-5-5:fast": { input: 8, output: 40, cacheRead: 0.4, cacheWrite: 10 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.1, cacheWrite: 2.5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
};

export function turnCostUsd(model: string, usage: ModelUsage): number {
  const p = PRICES[model] ?? PRICES["claude-opus-5-5"];
  return (
    usage.input_tokens * p.input +
    usage.output_tokens * p.output +
    usage.cache_read_input_tokens * p.cacheRead +
    usage.cache_creation_input_tokens * p.cacheWrite
  ) / 1_000_000;
}
