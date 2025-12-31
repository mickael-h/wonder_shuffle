import { CardEffects } from "../models/CardEffects.js";
import {
  renderStandardEffect,
  renderChaosEffect,
  renderOrderEffect,
  renderCoinEffect,
  renderMischiefEffect,
} from "./effectRenderers/EffectRenderers.js";
import { DiceRollHandler } from "./effectRenderers/DiceRollHandler.js";

/**
 * Handles rendering of card effects in the DOM
 */
export class EffectsRenderer {
  constructor() {
    this.effectsDisplay = null;
    this.effectsList = null;
    this.chaosSelections = [];
    this.orderSelections = [];
    this.coinSelection = "jewelry";
    this.onUpdateCallback = null;
    this.onMischiefDrawCallback = null;
    this.diceRollHandler = null;
  }

  /**
   * Initializes the effects renderer
   * @param {Function} onUpdate - Callback function to call when effects need re-rendering
   * @param {Function} onMischiefDraw - Callback function to call when mischief draw button is clicked
   */
  initialize(onUpdate, onMischiefDraw) {
    this.onUpdateCallback = onUpdate;
    this.onMischiefDrawCallback = onMischiefDraw;
    this.effectsDisplay = document.getElementById("effects-display");
    this.effectsList = document.getElementById("effects-list");

    if (!this.effectsDisplay || !this.effectsList) {
      console.error("Effects display elements not found");
      return false;
    }

    this.diceRollHandler = new DiceRollHandler(
      this.effectsDisplay,
      this.effectsList
    );

    return true;
  }

  /**
   * Resets selections when new cards are drawn
   * @param {Array<string>} drawnCards - Array of drawn card names
   */
  resetSelections(drawnCards) {
    const chaosCount = drawnCards.filter((card) => card === "chaos").length;
    this.chaosSelections = new Array(chaosCount).fill("acid");
    const orderCount = drawnCards.filter((card) => card === "order").length;
    this.orderSelections = new Array(orderCount).fill("force");
    this.coinSelection = "jewelry";
  }

  /**
   * Clears all selections
   */
  clearSelections() {
    this.chaosSelections = [];
    this.orderSelections = [];
    this.coinSelection = "jewelry";
  }

  /**
   * Updates the effects display with current drawn cards
   * @param {Array<string>} drawnCards - Array of drawn card names
   */
  renderEffects(drawnCards) {
    if (!this.effectsDisplay || !this.effectsList) {
      return;
    }

    if (!drawnCards || drawnCards.length === 0) {
      this.effectsDisplay.classList.add("empty");
      return;
    }

    const { regular, curses } = CardEffects.calculateEffects(drawnCards);

    if (regular.length === 0 && curses.length === 0) {
      this.effectsDisplay.classList.add("empty");
      return;
    }

    this.effectsDisplay.classList.remove("empty");
    this.effectsList.innerHTML = "";

    // Ensure roll dice button exists
    if (this.diceRollHandler) {
      this.diceRollHandler.ensureRollDiceButton(() => {
        if (this.diceRollHandler) {
          this.diceRollHandler.rollAllDice();
        }
      });
    }

    // Render regular effects
    if (regular.length > 0) {
      const hasIsolation = drawnCards.includes("isolation");
      regular.forEach((effect) => {
        if (effect.effect && typeof effect.effect === "object") {
          if (effect.effect.type === "chaos") {
            renderChaosEffect(
              effect,
              this.effectsList,
              this.chaosSelections,
              (index, value) => {
                this.chaosSelections[index] = value;
                if (this.onUpdateCallback) {
                  this.onUpdateCallback();
                }
              }
            );
          } else if (effect.effect.type === "coin") {
            renderCoinEffect(
              effect,
              this.effectsList,
              this.coinSelection,
              (value) => {
                this.coinSelection = value;
                if (this.onUpdateCallback) {
                  this.onUpdateCallback();
                }
              }
            );
          } else if (effect.effect.type === "order") {
            renderOrderEffect(
              effect,
              this.effectsList,
              this.orderSelections,
              (index, value) => {
                this.orderSelections[index] = value;
                if (this.onUpdateCallback) {
                  this.onUpdateCallback();
                }
              }
            );
          } else if (effect.effect.type === "mischief") {
            renderMischiefEffect(
              effect,
              this.effectsList,
              hasIsolation,
              this.onMischiefDrawCallback
            );
          } else {
            renderStandardEffect(effect, this.effectsList, false);
          }
        } else {
          renderStandardEffect(effect, this.effectsList, false);
        }
      });
    }

    // Render curse effects
    if (curses.length > 0) {
      curses.forEach((effect) => {
        renderStandardEffect(effect, this.effectsList, true);
      });
    }
  }
}
