/**
 * Card effects definitions and calculation
 * Effects stack when the same card is drawn multiple times
 */
export class CardEffects {
  /**
   * Get the effect description for a card
   * @param {string} cardName - Name of the card
   * @param {number} count - Number of times this card was drawn
   * @returns {string|null} Effect description, or null if card has no effect
   */
  static getEffect(cardName, count) {
    if (count === 0) {
      return null;
    }

    switch (cardName) {
      case "beginning": {
        const d10Count = 2 * count; // Stack: 2d10 per card
        return `Your hit point maximum and current hit points increase by ${d10Count}d10. Your hit point maximum remains increased in this way for the next 8 hours.`;
      }
      case "champion": {
        const bonus = count; // Stack: +1 per card
        return `You gain a +${bonus} bonus to weapon attack and damage rolls. This bonus lasts for 8 hours.`;
      }
      case "chancellor": {
        // Does not stack - one use regardless of count
        return `Within 8 hours of drawing this card, you can cast Augury once as an action, requiring no material components. Use your Intelligence, Wisdom, or Charisma as the spellcasting ability (your choice).`;
      }
      case "chaos": {
        // Special handling - returns object instead of string to indicate dropdowns needed
        return {
          type: "chaos",
          count: count,
          damageTypes: ["acid", "cold", "fire", "lightning", "thunder"],
        };
      }
      case "coin": {
        // Special handling - returns object for choice between jewelry and gemstones
        return {
          type: "coin",
          count: count,
          choices: [
            { value: "jewelry", label: "Jewelry", quantity: 5, worth: 100 },
            { value: "gemstones", label: "Gemstones", quantity: 10, worth: 50 },
          ],
        };
      }
      case "crown": {
        // Does not stack - one effect regardless of count
        return `You learn the Friends cantrip. Use your Intelligence, Wisdom, or Charisma as the spellcasting ability (your choice). If you already know this cantrip, the card has no effect.`;
      }
      case "dawn": {
        // Does not stack - one effect regardless of count
        return `This card invigorates you. For the next 8 hours, you can add your proficiency bonus to your initiative rolls.`;
      }
      case "day": {
        const bonus = count; // Stack: +1 per card
        return `You gain a +${bonus} bonus to saving throws. This benefit lasts until you finish a long rest.`;
      }
      case "destiny": {
        // Does not stack - one effect regardless of count
        return `This card protects you against an untimely demise. The first time after drawing this card that you would drop to 0 hit points from taking damage, you instead drop to 1 hit point.`;
      }
      case "dusk": {
        // Does not stack - one effect regardless of count, marked as curse
        return {
          text: `This card supernaturally saps your energy. You have disadvantage on initiative rolls. This effect lasts until you finish a long rest, but it can be ended early by a Remove Curse spell or similar magic.`,
          isCurse: true,
        };
      }
      case "end": {
        // Stack: 2d10 per card, marked as curse
        const d10Count = 2 * count;
        return {
          text: `This card is an omen of death. You take ${d10Count}d10 necrotic damage, and your hit point maximum is reduced by an amount equal to the damage taken. This effect can't reduce your hit point maximum below 10 hit points. This reduction lasts until you finish a long rest, but it can be ended early by a Remove Curse spell or similar magic.`,
          isCurse: true,
        };
      }
      case "isolation": {
        // Does not stack - one effect regardless of count, marked as curse
        return {
          text: `You disappear, along with anything you are wearing or carrying, and become trapped in a harmless extradimensional space for 1d4 minutes. You draw no more cards. You then reappear in the space you left or the nearest unoccupied space. When you reappear, you must succeed on a DC 11 Constitution saving throw or have the poisoned condition for 1 hour as your body reels from the extradimensional travel.`,
          isCurse: true,
        };
      }
      case "justice": {
        // Does not stack - one effect regardless of count
        return `You momentarily gain the ability to balance the scales of fate. For the next 8 hours, whenever you or a creature within 60 feet of you is about to roll a d20 with advantage or disadvantage, you can use your reaction to prevent the roll from being affected by advantage or disadvantage.`;
      }
      case "knife": {
        // Stacks - one weapon per card
        const weaponCount = count === 1 ? "An" : count;
        const weaponText = count === 1 ? "weapon" : "weapons";
        return `${weaponCount} uncommon magic ${weaponText} you're proficient with ${count === 1 ? "appears" : "appear"} in your hands. The DM chooses the ${weaponText}.`;
      }
      case "lock": {
        // Stacks: 1d3 per card
        const d3Count = count;
        return `You gain the ability to cast Knock ${d3Count}d3 times. Use your Intelligence, Wisdom, or Charisma as the spellcasting ability (your choice).`;
      }
      case "monster": {
        // Stacks: 1d4 per card
        const d4Count = count;
        return {
          text: `This card's monstrous visage curses you. While cursed in this way, whenever you make a saving throw, you must roll ${d4Count}d4 and subtract the number rolled from the total. The curse lasts until you finish a long rest, but it can be ended early with a Remove Curse spell or similar magic.`,
          isCurse: true,
        };
      }
      case "mystery": {
        // Stacks: 1 additional card per card (does not stack in effect description, but multiple cards trigger multiple draws)
        return {
          text: `You have disadvantage on Intelligence saving throws for 1 hour. Discard this card and draw from the deck again; together, the two draws count as one of your declared draws.`,
          isCurse: true,
        };
      }
      case "night": {
        // Does not stack - one effect regardless of count
        return `You gain darkvision within a range of 300 feet. This darkvision lasts for 8 hours.`;
      }
      case "order": {
        // Special handling - returns object instead of string to indicate dropdowns needed
        return {
          type: "order",
          count: count,
          damageTypes: ["force", "necrotic", "poison", "psychic", "radiant"],
        };
      }
      case "student": {
        // Does not stack - one effect regardless of count
        return `You gain proficiency in Wisdom saving throws. If you already have this proficiency, you instead gain proficiency in Intelligence or Charisma saving throws (your choice).`;
      }
      case "vulture": {
        // Stacks: 1 item per card
        const itemText =
          count === 1
            ? "item or piece of equipment"
            : "items or pieces of equipment";
        const numberText = count === 1 ? "One" : count;
        return {
          text: `${numberText} nonmagical ${itemText} in your possession (chosen by the DM) ${count === 1 ? "disappears" : "disappear"}. The ${count === 1 ? "item" : "items"} remain nearby but concealed for a short time, so ${count === 1 ? "it can" : "they can"} be found with a successful DC 15 Wisdom (Perception) check. If the ${count === 1 ? "item isn't" : "items aren't"} recovered within 1 hour, ${count === 1 ? "it disappears" : "they disappear"} forever.`,
          isCurse: true,
        };
      }
      case "mischief": {
        // Stacks: 1 item or 2 additional cards per card
        const itemCount = count;
        const additionalCards = count * 2;
        const itemText = count === 1 ? "item" : "items";
        return {
          type: "mischief",
          count: count,
          text: `You receive ${count === 1 ? "an" : count} uncommon wondrous ${itemText} (chosen by the DM), or you can draw ${additionalCards} additional card${additionalCards === 1 ? "" : "s"} beyond your declared draws.`,
        };
      }
      default:
        return null;
    }
  }

  /**
   * Count occurrences of each card in the drawn cards array
   * @param {Array<string>} drawnCards - Array of card names
   * @returns {Map<string, number>} Map of card name to count
   */
  static countCards(drawnCards) {
    const counts = new Map();
    for (const card of drawnCards) {
      counts.set(card, (counts.get(card) || 0) + 1);
    }
    return counts;
  }

  /**
   * Calculate all effects from drawn cards
   * @param {Array<string>} drawnCards - Array of card names
   * @returns {Object} Object with regular and curse effects arrays
   */
  static calculateEffects(drawnCards) {
    if (!drawnCards || drawnCards.length === 0) {
      return { regular: [], curses: [] };
    }

    const cardCounts = this.countCards(drawnCards);
    const regularEffects = [];
    const curseEffects = [];

    for (const [cardName, count] of cardCounts.entries()) {
      const effect = this.getEffect(cardName, count);
      if (effect) {
        const effectData = {
          card: cardName,
          count: count,
          effect: effect,
        };

        // Check if effect is a curse
        if (typeof effect === "object" && effect.isCurse) {
          curseEffects.push({
            ...effectData,
            effect: effect.text, // Use the text property for curses
          });
        } else {
          regularEffects.push(effectData);
        }
      }
    }

    return { regular: regularEffects, curses: curseEffects };
  }

  /**
   * Calculate Chaos resistances durations based on damage type selections
   * @param {Array<string>} selections - Array of selected damage types (one per Chaos card)
   * @returns {Map<string, number>} Map of damage type to d12 count
   */
  static calculateChaosDurations(selections) {
    const durations = new Map();
    for (const damageType of selections) {
      durations.set(damageType, (durations.get(damageType) || 0) + 1);
    }
    return durations;
  }

  /**
   * Calculate Order resistances durations based on damage type selections
   * @param {Array<string>} selections - Array of selected damage types (one per Order card)
   * @returns {Map<string, number>} Map of damage type to d12 count
   */
  static calculateOrderDurations(selections) {
    const durations = new Map();
    for (const damageType of selections) {
      durations.set(damageType, (durations.get(damageType) || 0) + 1);
    }
    return durations;
  }
}
