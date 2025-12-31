import { rollDiceInText } from "../../utils/diceRoller.js";

/**
 * Handles dice rolling UI logic for effects
 */
export class DiceRollHandler {
  constructor(effectsDisplay, effectsList) {
    this.effectsDisplay = effectsDisplay;
    this.effectsList = effectsList;
  }

  /**
   * Ensures the roll dice button exists and is properly set up
   * @param {Function} onRollClick - Callback when button is clicked
   */
  ensureRollDiceButton(onRollClick) {
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
    newButton.addEventListener("click", () => {
      if (onRollClick) {
        onRollClick();
      }
    });
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

    // Also handle Chaos and Order duration items
    const durationItems = this.effectsList.querySelectorAll(
      ".chaos-duration-item"
    );
    durationItems.forEach((durationElement) => {
      const originalText = durationElement.textContent;
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

