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

// Animation and interaction constants
export const ANIMATION_CONSTANTS = {
  HOVER_INTENSITY: 5, // pixels for hover up/down motion
  HOVER_DURATION_MIN: 4000, // milliseconds
  HOVER_DURATION_MAX: 5000, // milliseconds
  CARD_ANIMATION_DELAY: 150, // milliseconds between card animations
  CANVAS_PADDING: 60, // pixels (30px top + 30px bottom)
  CANVAS_PADDING_MIN: 40, // minimum padding for small draws
  EASE_FACTOR_HOVER: 0.1, // ease factor for hovered card movement/scaling
  EASE_FACTOR_RESET: 0.2, // ease factor for resetting cards
  EASE_FACTOR_PROXIMITY: 0.15, // ease factor for proximity scaling
  MAX_PROXIMITY_DISTANCE: 300, // pixels for proximity scaling effect
  MAX_SCALE_INCREASE: 0.1, // 10% scale increase at maximum proximity
  HOVERED_CARD_ZINDEX: 1000, // z-index for hovered cards
  SMOOTH_SCROLL_DURATION: 300, // milliseconds
};

// Layout constants
export const LAYOUT_CONSTANTS = {
  CARDS_PER_ROW: 5,
  CARD_SPACING_RATIO: 0.25, // spacing is 25% of card width
};
