import { DECK_SIZES, DECK_CONFIG } from "./constants.js";
import { AppInitializer } from "./core/AppInitializer.js";
import { DeckManager } from "./models/DeckManager.js";
import { CardRenderer } from "./renderers/CardRenderer.js";
import { GameRenderer } from "./renderers/GameRenderer.js";
import { EffectsRenderer } from "./renderers/EffectsRenderer.js";
import { UIManager } from "./managers/UIManager.js";

/**
 * Main game class that orchestrates all game components
 */
class CardGame {
  constructor() {
    this.app = null;
    this.deckManager = null;
    this.cardRenderer = null;
    this.gameRenderer = null;
    this.effectsRenderer = null;
    this.uiManager = null;
    this.drawnCards = [];

    this.init();
  }

  async init() {
    try {
      this.app = await AppInitializer.initialize();
      this.deckManager = new DeckManager();
      this.cardRenderer = new CardRenderer();
      this.gameRenderer = new GameRenderer(this.app, this.cardRenderer);
      this.effectsRenderer = new EffectsRenderer();
      this.effectsRenderer.initialize(
        () => this.updateEffectsDisplay(),
        () => this.handleMischiefDraw()
      );
      this.uiManager = new UIManager();

      this.uiManager.setup(
        (count) => this.handleDrawCardsAsync(count),
        (size, selectedCards) => this.handleDeckSizeChange(size, selectedCards)
      );
    } catch (error) {
      console.error("Failed to initialize game:", error);
    }
  }

  /**
   * Handles drawing cards from the deck
   * @param {number} count - Number of cards to draw
   * @returns {Promise<void>}
   */
  async handleDrawCards(count) {
    if (!Number.isInteger(count) || count <= 0) {
      return;
    }

    if (count > DECK_CONFIG.MAX_DRAW) {
      return;
    }

    if (this.deckManager.isEmpty()) {
      return;
    }

    let drawnCards = this.deckManager.drawCards(count);

    // If Isolation is drawn, only keep cards drawn before and including Isolation
    const isolationIndex = drawnCards.indexOf("isolation");
    if (isolationIndex !== -1) {
      drawnCards = drawnCards.slice(0, isolationIndex + 1);
    }

    // Handle Mystery cards: draw 1 additional card per Mystery (ignoring max draw limit)
    const mysteryCount = drawnCards.filter((card) => card === "mystery").length;
    if (mysteryCount > 0 && !drawnCards.includes("isolation")) {
      for (let i = 0; i < mysteryCount; i++) {
        const extraCards = this.deckManager.drawCards(1);
        if (extraCards && extraCards.length > 0) {
          drawnCards = [...drawnCards, ...extraCards];
          // Check if Isolation was drawn in the extra cards
          const newIsolationIndex = drawnCards.indexOf("isolation");
          if (newIsolationIndex !== -1) {
            drawnCards = drawnCards.slice(0, newIsolationIndex + 1);
            break; // Stop drawing extra cards if Isolation appears
          }
        }
      }
    }

    this.drawnCards = drawnCards;
    this.effectsRenderer.resetSelections(this.drawnCards);
    await this.gameRenderer.renderCards(this.drawnCards);
    this.updateEffectsDisplay();
  }

  /**
   * Handles drawing cards from the deck (async wrapper for UI callback)
   * @param {number} count - Number of cards to draw
   */
  async handleDrawCardsAsync(count) {
    await this.handleDrawCards(count);
  }

  /**
   * Handles deck size change
   * @param {number|string} size - New deck size (13, 22) or DECK_SIZES.CUSTOM
   * @param {string[]} [selectedCards] - Selected card names for custom deck (when size is CUSTOM)
   */
  async handleDeckSizeChange(size, selectedCards = null) {
    this.deckManager.createDeck(size, selectedCards);
    this.drawnCards = [];
    this.effectsRenderer.clearSelections();
    await this.gameRenderer.renderCards([]);
    this.updateEffectsDisplay();
  }

  /**
   * Updates the effects display with current drawn cards
   */
  updateEffectsDisplay() {
    if (this.effectsRenderer) {
      this.effectsRenderer.renderEffects(this.drawnCards);
    }
  }

  /**
   * Handles drawing cards via Mischief card button
   * Draws 2 cards and removes 1 mischief from drawn cards
   */
  async handleMischiefDraw() {
    // Check if isolation is already drawn
    if (this.drawnCards.includes("isolation")) {
      return;
    }

    // Draw 2 cards
    let newCards = this.deckManager.drawCards(2);

    // If Isolation is drawn as the first card, don't draw the second
    if (newCards.length > 0 && newCards[0] === "isolation") {
      newCards = [newCards[0]];
    } else if (newCards.length > 1 && newCards[1] === "isolation") {
      // If Isolation is second, only keep first two
      newCards = newCards.slice(0, 2);
    }

    // Remove one mischief from drawnCards
    const mischiefIndex = this.drawnCards.indexOf("mischief");
    if (mischiefIndex !== -1) {
      this.drawnCards.splice(mischiefIndex, 1);
    }

    // Add new cards to drawnCards
    this.drawnCards = [...this.drawnCards, ...newCards];

    // If Isolation is now in drawnCards, slice to only include cards up to and including Isolation
    const isolationIndex = this.drawnCards.indexOf("isolation");
    if (isolationIndex !== -1) {
      this.drawnCards = this.drawnCards.slice(0, isolationIndex + 1);
    }

    // Reset selections and update display
    this.effectsRenderer.resetSelections(this.drawnCards);
    await this.gameRenderer.renderCards(this.drawnCards);
    this.updateEffectsDisplay();
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    new CardGame();
  } catch (error) {
    console.error("Failed to initialize CardGame:", error);
  }
});
