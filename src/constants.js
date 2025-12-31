// Canvas configuration
export const CANVAS_CONFIG = {
  WIDTH: 1000,
  HEIGHT: 600,
  BACKGROUND_COLOR: 0x000000,
};

// Card dimensions and styling
export const CARD_CONFIG = {
  WIDTH: 400,
  HEIGHT: 560,
  SPACING: 20,
};

// Tarot card deck configuration
export const TAROT_CARDS = {
  FULL: [
    "beginning",
    "champion",
    "chancellor",
    "chaos",
    "coin",
    "crown",
    "dawn",
    "day",
    "destiny",
    "dusk",
    "end",
    "isolation",
    "justice",
    "knife",
    "lock",
    "mischief",
    "monster",
    "mystery",
    "night",
    "order",
    "student",
    "vulture",
  ],
  REDUCED: [
    "day",
    "night",
    "dawn",
    "crown",
    "lock",
    "champion",
    "chaos",
    "order",
    "beginning",
    "end",
    "monster",
    "knife",
    "mischief",
  ],
};

export const DECK_SIZES = {
  FULL: 22,
  REDUCED: 13,
};

export const DECK_CONFIG = {
  DEFAULT_SIZE: DECK_SIZES.FULL,
  MAX_DRAW: 20, // Maximum number of cards that can be drawn regardless of deck size
};
