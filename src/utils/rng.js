import * as prand from "pure-rand";

/**
 * Random Number Generator utility using pure-rand for better distribution
 * Uses Xoroshiro128+ algorithm for high-quality randomness
 */
class RNG {
  constructor() {
    // Initialize with a seed based on current time for non-deterministic randomness
    // Using Date.now() provides sufficient entropy for most use cases
    const seed = Date.now() >>> 0; // Ensure it's an unsigned 32-bit integer
    this.rng = prand.xoroshiro128plus(seed);
  }

  /**
   * Generates a random floating-point number between 0 (inclusive) and 1 (exclusive)
   * Similar to Math.random()
   * @returns {number} Random number between 0 and 1
   */
  random() {
    // Generate a random integer in the full 32-bit range and normalize to [0, 1)
    const [value, newRng] = prand.uniformIntDistribution(
      0,
      0xffffffff,
      this.rng
    );
    this.rng = newRng;
    // Normalize to [0, 1) range by dividing by 2^32
    return value / 0x100000000;
  }

  /**
   * Generates a random integer between min (inclusive) and max (inclusive)
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random integer in the specified range
   */
  randomInt(min, max) {
    const [value, newRng] = prand.uniformIntDistribution(min, max, this.rng);
    this.rng = newRng;
    return value;
  }
}

// Create a singleton instance
const rng = new RNG();

/**
 * Gets a random floating-point number between 0 (inclusive) and 1 (exclusive)
 * Drop-in replacement for Math.random()
 * @returns {number} Random number between 0 and 1
 */
export function random() {
  return rng.random();
}

/**
 * Gets a random integer between min (inclusive) and max (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer in the specified range
 */
export function randomInt(min, max) {
  return rng.randomInt(min, max);
}
