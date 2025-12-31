import { randomInt } from "./rng.js";

/**
 * Parses a dice expression (e.g., "4d10", "2d12", "2d12kh1") into quantity, sides, and keep highest
 * @param {string} diceExpression - Dice expression to parse (e.g., "4d10", "2d12kh1")
 * @returns {Object|null} Object with {quantity, sides, keepHighest} or null if invalid
 */
function parseDiceExpression(diceExpression) {
  // Match format: XdY or XdYkh1 (where kh1 means keep highest 1)
  const match = diceExpression.match(/^(\d+)d(\d+)(?:kh1)?$/);
  if (!match) {
    return null;
  }
  const quantity = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const hasKeepHighest = diceExpression.includes("kh1");
  if (isNaN(quantity) || isNaN(sides) || quantity < 1 || sides < 1) {
    return null;
  }
  return { quantity, sides, keepHighest: hasKeepHighest };
}

/**
 * Rolls a dice expression (e.g., "4d10", "2d12", "2d12kh1") using our pure-rand RNG and returns the total
 * @param {string} diceExpression - Dice expression to roll (e.g., "4d10", "2d12kh1")
 * @returns {number} Total of the dice roll (sum of all dice, or max if kh1 is used)
 */
export function rollDiceExpression(diceExpression) {
  try {
    const parsed = parseDiceExpression(diceExpression);
    if (!parsed) {
      console.error(`Invalid dice expression: "${diceExpression}"`);
      return 0;
    }

    // If kh1 (keep highest 1), use max logic
    if (parsed.keepHighest) {
      if (parsed.quantity === 0) {
        return 0;
      }
      let max = 0;
      for (let i = 0; i < parsed.quantity; i++) {
        const roll = randomInt(1, parsed.sides);
        max = Math.max(max, roll);
      }
      return max;
    }

    // Otherwise, sum all dice
    let total = 0;
    for (let i = 0; i < parsed.quantity; i++) {
      total += randomInt(1, parsed.sides);
    }
    return total;
  } catch (error) {
    console.error(`Error rolling dice expression "${diceExpression}":`, error);
    return 0;
  }
}

/**
 * Finds and replaces all dice expressions in text with rolled values
 * Pattern matches expressions like "4d10", "2d12", "2d12kh1", etc.
 * @param {string} text - Text containing dice expressions
 * @returns {string} Text with dice expressions replaced by rolled values
 */
export function rollDiceInText(text) {
  // Pattern to match dice expressions like "4d10", "2d12", "2d12kh1", "1d4", etc.
  // Matches: number, 'd', number, optional "kh1" (e.g., "4d10", "2d12", "2d12kh1")
  const dicePattern = /\b(\d+d\d+(?:kh1)?)\b/g;

  return text.replace(dicePattern, (match) => {
    const rolledValue = rollDiceExpression(match);
    return rolledValue.toString();
  });
}
