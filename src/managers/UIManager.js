import { DECK_SIZES, DECK_CONFIG, TAROT_CARDS } from "../constants.js";

/**
 * Manages UI interactions
 */
export class UIManager {
  constructor() {
    this.drawButton = null;
    this.cardCountInput = null;
    this.deckSizeRadios = null;
    this.customDeckSection = null;
    this.customDeckCardsContainer = null;
    this.onDrawCardsCallback = null;
    this.onDeckSizeChangeCallback = null;
    this.isCustomMode = false;
  }

  /**
   * Initializes UI elements and event listeners
   * @param {Function} onDrawCards - Callback for draw button click
   * @param {Function} onDeckSizeChange - Callback for deck size change (size, selectedCards)
   */
  setup(onDrawCards, onDeckSizeChange) {
    this.onDrawCardsCallback = onDrawCards;
    this.onDeckSizeChangeCallback = onDeckSizeChange;

    this.drawButton = document.getElementById("draw-button");
    this.cardCountInput = document.getElementById("card-count");
    this.deckSizeRadios = document.querySelectorAll('input[name="deck-size"]');
    this.customDeckSection = document.getElementById("custom-deck-section");
    this.customDeckCardsContainer = document.getElementById("custom-deck-cards");

    if (!this.drawButton || !this.cardCountInput || this.deckSizeRadios.length === 0) {
      console.error("Required UI elements not found");
      return false;
    }

    this.buildCustomDeckCheckboxes();

    // Set initial max draw based on checked radio
    const checkedRadio = document.querySelector('input[name="deck-size"]:checked');
    if (checkedRadio) {
      this.handleDeckSizeRadioChange(checkedRadio);
    }

    this.attachEventListeners();
    this.updateMaxDrawLimit();
    return true;
  }

  /**
   * Builds checkbox list for custom deck card selection
   */
  buildCustomDeckCheckboxes() {
    if (!this.customDeckCardsContainer) return;

    this.customDeckCardsContainer.innerHTML = "";
    for (const cardName of TAROT_CARDS.FULL) {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "custom-deck-card";
      checkbox.value = cardName;
      checkbox.checked = true;
      const span = document.createElement("span");
      span.textContent = cardName.charAt(0).toUpperCase() + cardName.slice(1);
      label.appendChild(checkbox);
      label.appendChild(span);
      this.customDeckCardsContainer.appendChild(label);
    }
  }

  /**
   * Handles deck size radio change
   * @param {HTMLInputElement} radio - The checked radio element
   */
  handleDeckSizeRadioChange(radio) {
    const value = radio.value;
    if (value === DECK_SIZES.CUSTOM) {
      this.isCustomMode = true;
      this.customDeckSection?.classList.add("visible");
      this.customDeckSection?.setAttribute("aria-hidden", "false");
      if (this.onDeckSizeChangeCallback) {
        this.onDeckSizeChangeCallback(DECK_SIZES.CUSTOM, this.getSelectedCustomCards());
      }
    } else {
      this.isCustomMode = false;
      this.customDeckSection?.classList.remove("visible");
      this.customDeckSection?.setAttribute("aria-hidden", "true");
      if (this.onDeckSizeChangeCallback) {
        this.onDeckSizeChangeCallback(parseInt(value, 10), null);
      }
    }
  }

  /**
   * Gets the list of selected card names for custom deck
   * @returns {string[]} Array of selected card names
   */
  getSelectedCustomCards() {
    if (!this.customDeckCardsContainer) return [];
    const checkboxes = this.customDeckCardsContainer.querySelectorAll(
      'input[name="custom-deck-card"]:checked'
    );
    return Array.from(checkboxes).map((cb) => cb.value);
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
          this.handleDeckSizeRadioChange(event.target);
          this.updateMaxDrawLimit();
        }
      });
    });

    // Listen for custom deck checkbox changes
    this.customDeckCardsContainer?.addEventListener("change", () => {
      if (this.isCustomMode && this.onDeckSizeChangeCallback) {
        this.onDeckSizeChangeCallback(DECK_SIZES.CUSTOM, this.getSelectedCustomCards());
      }
    });
  }

  /**
   * Updates the max attribute of the card count input
   */
  updateMaxDrawLimit() {
    this.cardCountInput.max = DECK_CONFIG.MAX_DRAW;
    if (parseInt(this.cardCountInput.value, 10) > DECK_CONFIG.MAX_DRAW) {
      this.cardCountInput.value = DECK_CONFIG.MAX_DRAW;
    }
  }

  /**
   * Validates card count input
   * @param {number} count - Card count to validate
   * @returns {boolean} True if count is valid
   */
  isValidCardCount(count) {
    return !Number.isNaN(count) && count > 0 && count <= DECK_CONFIG.MAX_DRAW;
  }
}
