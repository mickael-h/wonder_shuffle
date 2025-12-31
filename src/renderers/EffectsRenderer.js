import { CardEffects } from "../models/CardEffects.js";
import { capitalizeFirst } from "../utils/stringUtils.js";
import { rollDiceInText } from "../utils/diceRoller.js";

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

    return true;
  }

  /**
   * Ensures the roll dice button exists and is properly set up
   */
  ensureRollDiceButton() {
    let rollDiceButton = document.getElementById("roll-dice-button");
    if (!rollDiceButton) {
      // Create the button if it doesn't exist
      rollDiceButton = document.createElement("button");
      rollDiceButton.id = "roll-dice-button";
      rollDiceButton.textContent = "Roll Dice";

      // Insert it after the h2 element
      const h2 = this.effectsDisplay.querySelector("h2");
      if (h2) {
        h2.after(rollDiceButton);
      }
    }

    // Remove any existing event listeners by cloning and replacing
    const newButton = rollDiceButton.cloneNode(true);
    rollDiceButton.parentNode.replaceChild(newButton, rollDiceButton);
    newButton.addEventListener("click", () => this.rollAllDice());
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

    // Recreate the roll dice button if it doesn't exist
    this.ensureRollDiceButton();

    // Render regular effects
    if (regular.length > 0) {
      const hasIsolation = drawnCards.includes("isolation");
      regular.forEach((effect) => {
        if (effect.effect && typeof effect.effect === "object") {
          if (effect.effect.type === "chaos") {
            this.renderChaosEffect(effect, this.effectsList);
          } else if (effect.effect.type === "coin") {
            this.renderCoinEffect(effect, this.effectsList);
          } else if (effect.effect.type === "order") {
            this.renderOrderEffect(effect, this.effectsList);
          } else if (effect.effect.type === "mischief") {
            this.renderMischiefEffect(effect, this.effectsList, hasIsolation);
          } else {
            this.renderStandardEffect(effect, this.effectsList, false);
          }
        } else {
          this.renderStandardEffect(effect, this.effectsList, false);
        }
      });
    }

    // Render curse effects
    if (curses.length > 0) {
      curses.forEach((effect) => {
        this.renderStandardEffect(effect, this.effectsList, true);
      });
    }
  }

  /**
   * Renders a standard effect
   * @param {Object} effect - Effect object
   * @param {HTMLElement} effectsList - Container element
   * @param {boolean} isCurse - Whether this is a curse effect
   */
  renderStandardEffect(effect, effectsList, isCurse = false) {
    const effectItem = document.createElement("div");
    effectItem.className = isCurse ? "effect-item curse-effect" : "effect-item";

    const cardName = document.createElement("div");
    cardName.className = isCurse
      ? "effect-card-name curse-name"
      : "effect-card-name";
    const cardNameText = capitalizeFirst(effect.card);
    const countText =
      effect.count > 1
        ? `<span class="effect-card-count">(x${effect.count})</span>`
        : "";
    cardName.innerHTML = `${cardNameText}${countText}`;

    const description = document.createElement("div");
    description.className = "effect-description";
    description.textContent = effect.effect;

    effectItem.appendChild(cardName);
    effectItem.appendChild(description);
    effectsList.appendChild(effectItem);
  }

  /**
   * Renders Chaos card effect with dropdowns and duration display
   * @param {Object} effect - Effect object for Chaos card
   * @param {HTMLElement} effectsList - Container element
   */
  renderChaosEffect(effect, effectsList) {
    const effectItem = document.createElement("div");
    effectItem.className = "effect-item";

    const cardName = document.createElement("div");
    cardName.className = "effect-card-name";
    const cardNameText = capitalizeFirst(effect.card);
    const countText =
      effect.count > 1
        ? `<span class="effect-card-count">(x${effect.count})</span>`
        : "";
    cardName.innerHTML = `${cardNameText}${countText}`;
    effectItem.appendChild(cardName);

    const dropdownsContainer = document.createElement("div");
    dropdownsContainer.className = "chaos-dropdowns";

    for (let i = 0; i < effect.count; i++) {
      const dropdownWrapper = document.createElement("div");
      dropdownWrapper.className = "chaos-dropdown-wrapper";

      const label = document.createElement("label");
      label.textContent = `Resistance ${i + 1}: `;
      label.className = "chaos-dropdown-label";

      const select = document.createElement("select");
      select.className = "chaos-damage-type-select";
      select.dataset.index = i;

      effect.effect.damageTypes.forEach((damageType) => {
        const option = document.createElement("option");
        option.value = damageType;
        option.textContent = capitalizeFirst(damageType);
        if (this.chaosSelections[i] === damageType) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      select.addEventListener("change", (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        this.chaosSelections[index] = e.target.value;
        if (this.onUpdateCallback) {
          this.onUpdateCallback();
        }
      });

      dropdownWrapper.appendChild(label);
      dropdownWrapper.appendChild(select);
      dropdownsContainer.appendChild(dropdownWrapper);
    }

    effectItem.appendChild(dropdownsContainer);

    const durations = CardEffects.calculateChaosDurations(this.chaosSelections);
    if (durations.size > 0) {
      const durationsContainer = document.createElement("div");
      durationsContainer.className = "chaos-durations";

      durations.forEach((d12Count, damageType) => {
        const durationItem = document.createElement("div");
        durationItem.className = "chaos-duration-item";
        const diceNotation =
          d12Count === 1 ? `${d12Count}d12` : `${d12Count}d12kh1`;
        durationItem.textContent = `${capitalizeFirst(damageType)}: ${diceNotation} days`;
        durationsContainer.appendChild(durationItem);
      });

      effectItem.appendChild(durationsContainer);
    }

    effectsList.appendChild(effectItem);
  }

  /**
   * Renders Order card effect with dropdowns and duration display
   * @param {Object} effect - Effect object for Order card
   * @param {HTMLElement} effectsList - Container element
   */
  renderOrderEffect(effect, effectsList) {
    const effectItem = document.createElement("div");
    effectItem.className = "effect-item";

    const cardName = document.createElement("div");
    cardName.className = "effect-card-name";
    const cardNameText = capitalizeFirst(effect.card);
    const countText =
      effect.count > 1
        ? `<span class="effect-card-count">(x${effect.count})</span>`
        : "";
    cardName.innerHTML = `${cardNameText}${countText}`;
    effectItem.appendChild(cardName);

    const dropdownsContainer = document.createElement("div");
    dropdownsContainer.className = "chaos-dropdowns";

    for (let i = 0; i < effect.count; i++) {
      const dropdownWrapper = document.createElement("div");
      dropdownWrapper.className = "chaos-dropdown-wrapper";

      const label = document.createElement("label");
      label.textContent = `Resistance ${i + 1}: `;
      label.className = "chaos-dropdown-label";

      const select = document.createElement("select");
      select.className = "chaos-damage-type-select";
      select.dataset.index = i;

      effect.effect.damageTypes.forEach((damageType) => {
        const option = document.createElement("option");
        option.value = damageType;
        option.textContent = capitalizeFirst(damageType);
        if (this.orderSelections[i] === damageType) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      select.addEventListener("change", (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        this.orderSelections[index] = e.target.value;
        if (this.onUpdateCallback) {
          this.onUpdateCallback();
        }
      });

      dropdownWrapper.appendChild(label);
      dropdownWrapper.appendChild(select);
      dropdownsContainer.appendChild(dropdownWrapper);
    }

    effectItem.appendChild(dropdownsContainer);

    const durations = CardEffects.calculateOrderDurations(this.orderSelections);
    if (durations.size > 0) {
      const durationsContainer = document.createElement("div");
      durationsContainer.className = "chaos-durations";

      durations.forEach((d12Count, damageType) => {
        const durationItem = document.createElement("div");
        durationItem.className = "chaos-duration-item";
        const diceNotation =
          d12Count === 1 ? `${d12Count}d12` : `${d12Count}d12kh1`;
        durationItem.textContent = `${capitalizeFirst(damageType)}: ${diceNotation} days`;
        durationsContainer.appendChild(durationItem);
      });

      effectItem.appendChild(durationsContainer);
    }

    effectsList.appendChild(effectItem);
  }

  /**
   * Renders Coin card effect with dropdown for jewelry/gemstones choice
   * @param {Object} effect - Effect object for Coin card
   * @param {HTMLElement} effectsList - Container element
   */
  renderCoinEffect(effect, effectsList) {
    const effectItem = document.createElement("div");
    effectItem.className = "effect-item";

    const cardName = document.createElement("div");
    cardName.className = "effect-card-name";
    const cardNameText = capitalizeFirst(effect.card);
    const countText =
      effect.count > 1
        ? `<span class="effect-card-count">(x${effect.count})</span>`
        : "";
    cardName.innerHTML = `${cardNameText}${countText}`;
    effectItem.appendChild(cardName);

    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "coin-dropdown-container";

    const label = document.createElement("label");
    label.textContent = "Reward type: ";
    label.className = "coin-dropdown-label";

    const select = document.createElement("select");
    select.className = "coin-reward-type-select";

    effect.effect.choices.forEach((choice) => {
      const option = document.createElement("option");
      option.value = choice.value;
      option.textContent = choice.label;
      if (this.coinSelection === choice.value) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      this.coinSelection = e.target.value;
      if (this.onUpdateCallback) {
        this.onUpdateCallback();
      }
    });

    dropdownContainer.appendChild(label);
    dropdownContainer.appendChild(select);
    effectItem.appendChild(dropdownContainer);

    const selectedChoice = effect.effect.choices.find(
      (choice) => choice.value === this.coinSelection
    );
    if (selectedChoice) {
      const totalQuantity = selectedChoice.quantity * effect.count;
      const totalWorth = totalQuantity * selectedChoice.worth;
      const description = document.createElement("div");
      description.className = "effect-description coin-description";
      description.textContent = `${totalQuantity} ${selectedChoice.label.toLowerCase()}, each worth ${selectedChoice.worth} gp, appear at your feet. (total: ${totalWorth} gp)`;
      effectItem.appendChild(description);
    }

    effectsList.appendChild(effectItem);
  }

  /**
   * Renders Mischief card effect with "Draw x2" button
   * @param {Object} effect - Effect object for Mischief card
   * @param {HTMLElement} effectsList - Container element
   * @param {boolean} hasIsolation - Whether isolation card has been drawn
   */
  renderMischiefEffect(effect, effectsList, hasIsolation) {
    const effectItem = document.createElement("div");
    effectItem.className = "effect-item";

    const cardName = document.createElement("div");
    cardName.className = "effect-card-name";
    const cardNameText = capitalizeFirst(effect.card);
    const countText =
      effect.count > 1
        ? `<span class="effect-card-count">(x${effect.count})</span>`
        : "";
    cardName.innerHTML = `${cardNameText}${countText}`;
    effectItem.appendChild(cardName);

    const description = document.createElement("div");
    description.className = "effect-description";
    description.textContent = effect.effect.text;
    effectItem.appendChild(description);

    // Only show button if isolation hasn't been drawn
    if (!hasIsolation && this.onMischiefDrawCallback) {
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "mischief-button-container";

      const drawButton = document.createElement("button");
      drawButton.className = "mischief-draw-button";
      drawButton.textContent = "Draw x2";
      drawButton.addEventListener("click", () => {
        if (this.onMischiefDrawCallback) {
          this.onMischiefDrawCallback();
        }
      });

      buttonContainer.appendChild(drawButton);
      effectItem.appendChild(buttonContainer);
    }

    effectsList.appendChild(effectItem);
  }

  /**
   * Rolls all dice in effect descriptions (except Monster) and updates the display
   */
  rollAllDice() {
    if (!this.effectsList) {
      return;
    }

    // Get all effect description elements
    const effectDescriptions = this.effectsList.querySelectorAll(
      ".effect-description"
    );

    effectDescriptions.forEach((descriptionElement) => {
      // Find the parent effect item to check if it's a Monster card
      const effectItem = descriptionElement.closest(".effect-item");
      if (!effectItem) {
        return;
      }

      // Check if this is a Monster card (curse-effect with "monster" in card name)
      const cardNameElement = effectItem.querySelector(".effect-card-name");
      if (cardNameElement) {
        const cardNameText = cardNameElement.textContent.toLowerCase();
        if (cardNameText.includes("monster")) {
          // Skip Monster cards
          return;
        }
      }

      // Roll dice in the description text
      const originalText = descriptionElement.textContent;
      const rolledText = rollDiceInText(originalText);
      descriptionElement.textContent = rolledText;
    });

    // Also handle Chaos and Order duration items (kh1 notation uses max automatically)
    const durationItems = this.effectsList.querySelectorAll(
      ".chaos-duration-item"
    );
    durationItems.forEach((durationElement) => {
      const originalText = durationElement.textContent;
      // Pattern matches "Xd12kh1" notation for durations (using general dice pattern)
      const rolledText = rollDiceInText(originalText);
      durationElement.textContent = rolledText;
    });

    // Replace all dropdowns with plain text
    this.convertDropdownsToText();

    // Remove the button after rolling
    const rollDiceButton = document.getElementById("roll-dice-button");
    if (rollDiceButton) {
      rollDiceButton.remove();
    }
  }

  /**
   * Converts all dropdowns (Chaos, Order, Coin) to plain text
   */
  convertDropdownsToText() {
    // Convert Chaos and Order dropdowns
    const chaosDropdownWrappers = this.effectsList.querySelectorAll(
      ".chaos-dropdown-wrapper"
    );
    chaosDropdownWrappers.forEach((wrapper) => {
      const label = wrapper.querySelector("label");
      const select = wrapper.querySelector("select");
      if (label && select) {
        const labelText = label.textContent.trim();
        const selectedOption = select.options[select.selectedIndex];
        const selectedText = selectedOption ? selectedOption.textContent : "";
        const textElement = document.createElement("div");
        textElement.className = "chaos-dropdown-label";
        textElement.style.marginBottom = "8px";
        textElement.textContent = `${labelText}${selectedText}`;
        wrapper.replaceWith(textElement);
      }
    });

    // Convert Coin dropdown
    const coinDropdownContainers = this.effectsList.querySelectorAll(
      ".coin-dropdown-container"
    );
    coinDropdownContainers.forEach((container) => {
      const label = container.querySelector("label");
      const select = container.querySelector("select");
      if (label && select) {
        const labelText = label.textContent.trim();
        const selectedOption = select.options[select.selectedIndex];
        const selectedText = selectedOption ? selectedOption.textContent : "";
        const textElement = document.createElement("div");
        textElement.className = "coin-dropdown-label";
        textElement.textContent = `${labelText}${selectedText}`;
        container.replaceWith(textElement);
      }
    });
  }
}
