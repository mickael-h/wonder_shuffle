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
   * @param {number|string} size - Deck size (13, 22) or DECK_SIZES.CUSTOM
   * @param {string[]} [customCards] - Array of card names for custom deck (required when size is CUSTOM)
   */
  createDeck(size = null, customCards = null) {
    let cardSet;
    if (size === DECK_SIZES.CUSTOM) {
      cardSet = customCards && customCards.length > 0 ? [...customCards] : [];
      this.deckSize = cardSet.length;
    } else {
      const targetSize = size ?? this.deckSize;
      cardSet =
        targetSize === DECK_SIZES.REDUCED
          ? TAROT_CARDS.REDUCED
          : TAROT_CARDS.FULL;
      this.deckSize = typeof targetSize === "number" ? targetSize : cardSet.length;
    }
    this.deck = [...cardSet];
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
    if (this.deck.length === 0) {
      return null;
    }
    // Randomly select cards without removing them from the deck (cards are reinserted after each draw)
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
