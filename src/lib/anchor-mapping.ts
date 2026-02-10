/**
 * Anchor Mapping Logic
 *
 * Maps user-facing anchor selections (LOWER BODY, UPPER BODY, FULL BODY, SURPRISE)
 * to specific movement patterns (squat, hinge, press, pull, power) for the API.
 *
 * Weights:
 * - LOWER BODY: squat vs hinge at 3:2 ratio
 * - UPPER BODY: press vs pull at 1:1 ratio
 * - FULL BODY: power weighted heavily
 * - SURPRISE: equal weights
 *
 * Avoidance: Tries not to repeat the most recent anchor in a category.
 */

import type { AnchorType, MovementPattern } from "@/components/AnchorGrid";

// Category mappings
const LOWER_PATTERNS: MovementPattern[] = ["squat", "hinge"];
const UPPER_PATTERNS: MovementPattern[] = ["press", "pull"];
const ALL_PATTERNS: MovementPattern[] = ["squat", "hinge", "press", "pull", "power"];

interface WorkoutHistoryEntry {
  anchor: string;
}

/**
 * Weighted random selection
 * @param options Array of [option, weight] tuples
 * @returns Selected option
 */
function weightedRandom<T>(options: [T, number][]): T {
  const totalWeight = options.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [option, weight] of options) {
    random -= weight;
    if (random <= 0) {
      return option;
    }
  }

  // Fallback to first option
  return options[0][0];
}

/**
 * Get recent anchors from a specific category
 */
function getRecentInCategory(
  history: WorkoutHistoryEntry[],
  category: "lower" | "upper" | "all"
): MovementPattern[] {
  const patterns = category === "lower"
    ? LOWER_PATTERNS
    : category === "upper"
      ? UPPER_PATTERNS
      : ALL_PATTERNS;

  return history
    .map(w => w.anchor.toLowerCase() as MovementPattern)
    .filter(a => patterns.includes(a));
}

/**
 * Resolve LOWER BODY to squat or hinge
 * Weights: 3:2 (squat 60%, hinge 40%)
 * Avoids most recent lower body anchor
 */
function resolveLowerBody(history: WorkoutHistoryEntry[]): MovementPattern {
  const recentLower = getRecentInCategory(history, "lower");
  const mostRecent = recentLower[0];

  // If we did one recently, prefer the other
  if (mostRecent === "squat") {
    // Still use weights but flip them: hinge 60%, squat 40%
    return weightedRandom([["hinge", 3], ["squat", 2]]);
  } else if (mostRecent === "hinge") {
    // squat 60%, hinge 40%
    return weightedRandom([["squat", 3], ["hinge", 2]]);
  }

  // No recent lower body, use standard weights
  return weightedRandom([["squat", 3], ["hinge", 2]]);
}

/**
 * Resolve UPPER BODY to press or pull
 * Weights: 1:1 (50% each)
 * Avoids most recent upper body anchor
 */
function resolveUpperBody(history: WorkoutHistoryEntry[]): MovementPattern {
  const recentUpper = getRecentInCategory(history, "upper");
  const mostRecent = recentUpper[0];

  // If we did one recently, prefer the other
  if (mostRecent === "press") {
    return weightedRandom([["pull", 3], ["press", 1]]);
  } else if (mostRecent === "pull") {
    return weightedRandom([["press", 3], ["pull", 1]]);
  }

  // No recent upper body, 50/50
  return weightedRandom([["press", 1], ["pull", 1]]);
}

/**
 * Resolve FULL BODY to any movement pattern
 * Weights: power heavily weighted
 * Avoids last 2-3 used
 */
function resolveFullBody(history: WorkoutHistoryEntry[]): MovementPattern {
  const recentAll = getRecentInCategory(history, "all").slice(0, 3);

  // Base weights: power is 40%, others split remaining 60%
  const baseWeights: [MovementPattern, number][] = [
    ["power", 40],
    ["squat", 15],
    ["hinge", 15],
    ["press", 15],
    ["pull", 15],
  ];

  // Reduce weight for recently used (but don't eliminate)
  const adjustedWeights = baseWeights.map(([pattern, weight]): [MovementPattern, number] => {
    const recencyIndex = recentAll.indexOf(pattern);
    if (recencyIndex === 0) {
      // Most recent: reduce to 10% of original
      return [pattern, weight * 0.1];
    } else if (recencyIndex === 1) {
      // Second most recent: reduce to 30%
      return [pattern, weight * 0.3];
    } else if (recencyIndex === 2) {
      // Third most recent: reduce to 60%
      return [pattern, weight * 0.6];
    }
    return [pattern, weight];
  });

  return weightedRandom(adjustedWeights);
}

/**
 * Resolve SURPRISE to any movement pattern
 * Weights: equal
 * Avoids last 2-3 used
 */
function resolveSurprise(history: WorkoutHistoryEntry[]): MovementPattern {
  const recentAll = getRecentInCategory(history, "all").slice(0, 3);

  // Equal base weights
  const baseWeights: [MovementPattern, number][] = [
    ["squat", 20],
    ["hinge", 20],
    ["press", 20],
    ["pull", 20],
    ["power", 20],
  ];

  // Reduce weight for recently used
  const adjustedWeights = baseWeights.map(([pattern, weight]): [MovementPattern, number] => {
    const recencyIndex = recentAll.indexOf(pattern);
    if (recencyIndex === 0) {
      return [pattern, weight * 0.1];
    } else if (recencyIndex === 1) {
      return [pattern, weight * 0.3];
    } else if (recencyIndex === 2) {
      return [pattern, weight * 0.6];
    }
    return [pattern, weight];
  });

  return weightedRandom(adjustedWeights);
}

/**
 * Main function: Map user anchor selection to movement pattern
 *
 * @param anchor User's selected anchor (LOWER BODY, UPPER BODY, FULL BODY, SURPRISE)
 * @param history Recent workout history (newest first)
 * @returns Movement pattern to send to API (squat, hinge, press, pull, power)
 */
export function resolveAnchorToPattern(
  anchor: AnchorType,
  history: WorkoutHistoryEntry[]
): MovementPattern {
  switch (anchor) {
    case "LOWER BODY":
      return resolveLowerBody(history);
    case "UPPER BODY":
      return resolveUpperBody(history);
    case "FULL BODY":
      return resolveFullBody(history);
    case "SURPRISE":
      return resolveSurprise(history);
    default:
      // Fallback
      return resolveSurprise(history);
  }
}
