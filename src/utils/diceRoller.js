import { randomInt } from "./rng.js";

/**
 * Parses a dice expression (e.g., "4d10", "2d12") into quantity and sides
 * @param {string} diceExpression - Dice expression to parse (e.g., "4d10")
 * @returns {Object|null} Object with {quantity, sides} or null if invalid
 */
function parseDiceExpression(diceExpression) {
  const match = diceExpression.match(/^(\d+)d(\d+)$/);
  if (!match) {
    return null;
  }
  const quantity = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  if (isNaN(quantity) || isNaN(sides) || quantity < 1 || sides < 1) {
    return null;
  }
  return { quantity, sides };
}

/**
 * Rolls a dice expression (e.g., "4d10", "2d12") using our pure-rand RNG and returns the total
 * @param {string} diceExpression - Dice expression to roll (e.g., "4d10")
 * @returns {number} Total of the dice roll
 */
export function rollDiceExpression(diceExpression) {
  try {
    const parsed = parseDiceExpression(diceExpression);
    if (!parsed) {
      console.error(`Invalid dice expression: "${diceExpression}"`);
      return 0;
    }

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
 * Pattern matches expressions like "4d10", "2d12", etc.
 * @param {string} text - Text containing dice expressions
 * @returns {string} Text with dice expressions replaced by rolled values
 */
export function rollDiceInText(text) {
  // Pattern to match dice expressions like "4d10", "2d12", "1d4", etc.
  // Matches: optional number, 'd', number (e.g., "4d10", "2d12", "1d4")
  const dicePattern = /\b(\d+d\d+)\b/g;

  return text.replace(dicePattern, (match) => {
    const rolledValue = rollDiceExpression(match);
    return rolledValue.toString();
  });
}
