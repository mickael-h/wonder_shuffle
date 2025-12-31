import { CardEffects } from "../../models/CardEffects.js";
import { capitalizeFirst } from "../../utils/stringUtils.js";

/**
 * Creates card name element with count
 * @param {string} cardName - Name of the card
 * @param {number} count - Count of the card
 * @param {boolean} isCurse - Whether this is a curse card
 * @returns {HTMLElement} Card name element
 */
function createCardNameElement(cardName, count, isCurse = false) {
  const cardNameElement = document.createElement("div");
  cardNameElement.className = isCurse
    ? "effect-card-name curse-name"
    : "effect-card-name";
  const cardNameText = capitalizeFirst(cardName);
  const countText =
    count > 1 ? `<span class="effect-card-count">(x${count})</span>` : "";
  cardNameElement.innerHTML = `${cardNameText}${countText}`;
  return cardNameElement;
}

/**
 * Renders a standard effect
 * @param {Object} effect - Effect object
 * @param {HTMLElement} effectsList - Container element
 * @param {boolean} isCurse - Whether this is a curse effect
 */
export function renderStandardEffect(effect, effectsList, isCurse = false) {
  const effectItem = document.createElement("div");
  effectItem.className = isCurse ? "effect-item curse-effect" : "effect-item";

  const cardName = createCardNameElement(effect.card, effect.count, isCurse);
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
 * @param {Array<string>} selections - Array of selected damage types
 * @param {Function} onSelectionChange - Callback when selection changes
 */
export function renderChaosEffect(effect, effectsList, selections, onSelectionChange) {
  const effectItem = document.createElement("div");
  effectItem.className = "effect-item";

  const cardName = createCardNameElement(effect.card, effect.count, false);
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
      if (selections[i] === damageType) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      if (onSelectionChange) {
        onSelectionChange(index, e.target.value);
      }
    });

    dropdownWrapper.appendChild(label);
    dropdownWrapper.appendChild(select);
    dropdownsContainer.appendChild(dropdownWrapper);
  }

  effectItem.appendChild(dropdownsContainer);

  const durations = CardEffects.calculateChaosDurations(selections);
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
 * @param {Array<string>} selections - Array of selected damage types
 * @param {Function} onSelectionChange - Callback when selection changes
 */
export function renderOrderEffect(effect, effectsList, selections, onSelectionChange) {
  const effectItem = document.createElement("div");
  effectItem.className = "effect-item";

  const cardName = createCardNameElement(effect.card, effect.count, false);
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
      if (selections[i] === damageType) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      if (onSelectionChange) {
        onSelectionChange(index, e.target.value);
      }
    });

    dropdownWrapper.appendChild(label);
    dropdownWrapper.appendChild(select);
    dropdownsContainer.appendChild(dropdownWrapper);
  }

  effectItem.appendChild(dropdownsContainer);

  const durations = CardEffects.calculateOrderDurations(selections);
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
 * @param {string} selection - Selected reward type
 * @param {Function} onSelectionChange - Callback when selection changes
 */
export function renderCoinEffect(effect, effectsList, selection, onSelectionChange) {
  const effectItem = document.createElement("div");
  effectItem.className = "effect-item";

  const cardName = createCardNameElement(effect.card, effect.count, false);
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
    if (selection === choice.value) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    if (onSelectionChange) {
      onSelectionChange(e.target.value);
    }
  });

  dropdownContainer.appendChild(label);
  dropdownContainer.appendChild(select);
  effectItem.appendChild(dropdownContainer);

  const selectedChoice = effect.effect.choices.find(
    (choice) => choice.value === selection
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
 * @param {Function} onMischiefDraw - Callback when draw button is clicked
 */
export function renderMischiefEffect(
  effect,
  effectsList,
  hasIsolation,
  onMischiefDraw
) {
  const effectItem = document.createElement("div");
  effectItem.className = "effect-item";

  const cardName = createCardNameElement(effect.card, effect.count, false);
  effectItem.appendChild(cardName);

  const description = document.createElement("div");
  description.className = "effect-description";
  description.textContent = effect.effect.text;
  effectItem.appendChild(description);

  // Only show button if isolation hasn't been drawn
  if (!hasIsolation && onMischiefDraw) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "mischief-button-container";

    const drawButton = document.createElement("button");
    drawButton.className = "mischief-draw-button";
    drawButton.textContent = "Draw x2";
    drawButton.addEventListener("click", () => {
      if (onMischiefDraw) {
        onMischiefDraw();
      }
    });

    buttonContainer.appendChild(drawButton);
    effectItem.appendChild(buttonContainer);
  }

  effectsList.appendChild(effectItem);
}

