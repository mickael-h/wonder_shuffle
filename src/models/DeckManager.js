import { TAROT_CARDS, DECK_SIZES, DECK_CONFIG } from "../constants.js";
import { randomInt } from "../utils/rng.js";

/**
 * Manages deck operations: creation, shuffling, and drawing cards
 */
export class DeckManager {
  constructor() {
    this.deck = [];
    this.deckSize = DECK_CONFIG.DEFAULT_SIZE;
    this.createDeck();
  }

  /**
   * Creates a tarot card deck from available card images
   * @param {number} size - Deck size (13 or 22)
   */
  createDeck(size = null) {
    const targetSize = size || this.deckSize;
    const cardSet =
      targetSize === DECK_SIZES.REDUCED
        ? TAROT_CARDS.REDUCED
        : TAROT_CARDS.FULL;
    this.deck = [...cardSet];
    this.deckSize = targetSize;
    this.shuffleDeck();
  }

  /**
   * Shuffles the deck using Fisher-Yates algorithm
   */
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  /**
   * Draws a specified number of cards from the deck
   * Cards are not removed from the deck and can be drawn multiple times
   * @param {number} count - Number of cards to draw
   * @returns {Array} Array of drawn cards (randomly selected)
   */
  drawCards(count) {
    if (count > this.deck.length) {
      return null;
    }
    // Randomly select cards without removing them from the deck
    const drawn = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = randomInt(0, this.deck.length - 1);
      drawn.push(this.deck[randomIndex]);
    }
    return drawn;
  }

  /**
   * Gets the current deck size
   * @returns {number} Number of cards in deck
   */
  getDeckSize() {
    return this.deck.length;
  }

  /**
   * Checks if deck is empty
   * @returns {boolean} True if deck is empty
   */
  isEmpty() {
    return this.deck.length === 0;
  }
}
