import { DECK_SIZES, DECK_CONFIG } from "../constants.js";

/**
 * Manages UI interactions
 */
export class UIManager {
  constructor() {
    this.drawButton = null;
    this.cardCountInput = null;
    this.deckSizeRadios = null;
    this.onDrawCardsCallback = null;
    this.onDeckSizeChangeCallback = null;
    this.currentMaxDraw = DECK_SIZES.FULL;
  }

  /**
   * Initializes UI elements and event listeners
   * @param {Function} onDrawCards - Callback for draw button click
   * @param {Function} onDeckSizeChange - Callback for deck size change
   */
  setup(onDrawCards, onDeckSizeChange) {
    this.onDrawCardsCallback = onDrawCards;
    this.onDeckSizeChangeCallback = onDeckSizeChange;

    this.drawButton = document.getElementById("draw-button");
    this.cardCountInput = document.getElementById("card-count");
    this.deckSizeRadios = document.querySelectorAll('input[name="deck-size"]');

    if (!this.drawButton || !this.cardCountInput || this.deckSizeRadios.length === 0) {
      console.error("Required UI elements not found");
      return false;
    }

    // Set initial max draw based on checked radio
    const checkedRadio = document.querySelector('input[name="deck-size"]:checked');
    if (checkedRadio) {
      this.currentMaxDraw = parseInt(checkedRadio.value, 10);
    }

    this.attachEventListeners();
    this.updateMaxDrawLimit();
    return true;
  }

  /**
   * Attaches event listeners to UI buttons
   */
  attachEventListeners() {
    this.drawButton.addEventListener("click", () => {
      const count = parseInt(this.cardCountInput.value, 10);
      if (!this.isValidCardCount(count)) {
        return;
      }
      if (this.onDrawCardsCallback) {
        this.onDrawCardsCallback(count);
      }
    });

    this.deckSizeRadios.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        if (event.target.checked) {
          const newSize = parseInt(event.target.value, 10);
          this.currentMaxDraw = newSize;
          this.updateMaxDrawLimit();
          if (this.onDeckSizeChangeCallback) {
            this.onDeckSizeChangeCallback(newSize);
          }
        }
      });
    });
  }

  /**
   * Updates the max attribute of the card count input based on current deck size
   * The max draw is limited to DECK_CONFIG.MAX_DRAW (20) regardless of deck size
   */
  updateMaxDrawLimit() {
    const maxDraw = Math.min(this.currentMaxDraw, DECK_CONFIG.MAX_DRAW);
    this.cardCountInput.max = maxDraw;
    if (parseInt(this.cardCountInput.value, 10) > maxDraw) {
      this.cardCountInput.value = maxDraw;
    }
  }

  /**
   * Validates card count input
   * @param {number} count - Card count to validate
   * @returns {boolean} True if count is valid
   */
  isValidCardCount(count) {
    const maxDraw = Math.min(this.currentMaxDraw, DECK_CONFIG.MAX_DRAW);
    return !Number.isNaN(count) && count > 0 && count <= maxDraw;
  }
}

