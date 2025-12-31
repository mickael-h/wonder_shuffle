# Game Architecture

This document describes the modular architecture of the Wonder Shuffle tarot card game.

## Project Structure

```
src/
├── constants.js              # Configuration constants (deck sizes, animation, layout)
├── main.js                   # Main game orchestrator (179 lines)
├── core/
│   └── AppInitializer.js    # PixiJS application initialization
├── models/
│   ├── DeckManager.js       # Deck management (creation, shuffling, drawing) - 73 lines
│   └── CardEffects.js       # Card effect definitions and calculations - 236 lines
├── renderers/
│   ├── CardRenderer.js      # Individual card sprite creation - 161 lines
│   ├── CardAnimator.js      # Card animation logic (flip, glitter, hover) - 307 lines
│   ├── GameRenderer.js      # Main rendering orchestrator - 297 lines
│   ├── ScrollManager.js     # PixiJS scrolling and drag handling - 342 lines
│   ├── CardHoverManager.js  # Cursor tracking and hover effects - 376 lines
│   ├── EffectsRenderer.js   # Effects display orchestrator - 168 lines
│   └── effectRenderers/
│       ├── EffectRenderers.js    # Individual effect rendering functions - 293 lines
│       └── DiceRollHandler.js    # Dice rolling and dropdown conversion - 200+ lines
├── managers/
│   └── UIManager.js         # UI interactions and controls
└── utils/
    ├── rng.js               # Random number generation (pure-rand wrapper) - 65 lines
    ├── diceRoller.js        # Dice rolling utilities - 76 lines
    └── stringUtils.js       # String utility functions - 16 lines
```

**Total Codebase**: ~2,265 lines across 17 modules

## Module Responsibilities

### Core Modules

#### `AppInitializer` (`src/core/AppInitializer.js`)

- **Responsibility**: Initializes PixiJS Application instance
- **Key Features**:
  - Creates and configures PixiJS Application with high-resolution rendering
  - Handles canvas attachment to DOM
  - Manages window resize events
  - Error handling for initialization

### Model Modules

#### `DeckManager` (`src/models/DeckManager.js`)

- **Responsibility**: Manages tarot deck operations
- **Methods**:
  - `createDeck(size)` - Creates deck of 13 or 22 tarot cards
  - `drawCards(count)` - Draws specified number of cards (cards can be drawn multiple times)
  - `getDeckSize()` - Returns deck size
  - `setDeckSize(size)` - Switches between 13-card and 22-card decks

#### `CardEffects` (`src/models/CardEffects.js`)

- **Responsibility**: Defines and calculates card effects
- **Features**:
  - Effect definitions for all 22 tarot cards
  - Stacking logic (which effects stack, which don't)
  - Curse identification
  - Dice calculation for effects (e.g., 2d10, 1d12kh1)

### Renderer Modules

#### `CardRenderer` (`src/renderers/CardRenderer.js`)

- **Responsibility**: Creates individual card sprites from image assets
- **Methods**:
  - `createCardSprite(cardName, isBackside)` - Creates card sprite from PNG assets
  - `loadCardTexture(cardName)` - Loads and caches card textures
  - `preloadAllTextures()` - Preloads all card images

#### `CardAnimator` (`src/renderers/CardAnimator.js`)

- **Responsibility**: Handles card animations
- **Features**:
  - Flip animation (back to front)
  - Glitter particle effects
  - Hover animation (subtle up/down motion)
  - Animation state management (`_isAnimating`, `_animationComplete` flags)

#### `GameRenderer` (`src/renderers/GameRenderer.js`)

- **Responsibility**: Orchestrates card rendering and layout
- **Dependencies**: ScrollManager, CardHoverManager, CardRenderer, CardAnimator
- **Methods**:
  - `renderCards(cardNames)` - Renders array of cards with animations
  - `clearCards()` - Clears all cards from canvas
  - `calculateCardPositions(cardCount, width, height)` - Calculates grid positions
- **Key Features**:
  - Grid layout (5 cards per row)
  - Sequential card animations with delays
  - Dynamic canvas sizing

#### `ScrollManager` (`src/renderers/ScrollManager.js`)

- **Responsibility**: Handles PixiJS-based scrolling
- **Features**:
  - Mouse and touch drag support
  - Momentum scrolling with friction
  - Viewport masking
  - Scroll constraints
  - Event listener management and cleanup

#### `CardHoverManager` (`src/renderers/CardHoverManager.js`)

- **Responsibility**: Manages cursor tracking and card interaction effects
- **Features**:
  - Cursor position tracking
  - Hover detection
  - Proximity-based card scaling
  - Hovered card centering and scaling
  - Prevents interference with active animations

#### `EffectsRenderer` (`src/renderers/EffectsRenderer.js`)

- **Responsibility**: Orchestrates card effects display
- **Methods**:
  - `updateEffects(drawnCards)` - Updates effects display
  - `clearEffects()` - Clears effects display
- **Delegates to**: EffectRenderers.js, DiceRollHandler.js

#### `EffectRenderers` (`src/renderers/effectRenderers/EffectRenderers.js`)

- **Responsibility**: Individual effect rendering functions
- **Functions**:
  - `renderStandardEffect()` - Standard text effects
  - `renderChaosEffect()` - Chaos card (damage resistance with dropdowns)
  - `renderOrderEffect()` - Order card (damage resistance with dropdowns)
  - `renderCoinEffect()` - Coin card (jewelry/gemstones choice)
  - `renderMischiefEffect()` - Mischief card (draw 2 button)
- **Features**:
  - Separates curses from normal effects
  - Handles stacking logic for display

#### `DiceRollHandler` (`src/renderers/effectRenderers/DiceRollHandler.js`)

- **Responsibility**: Dice rolling UI and text conversion
- **Features**:
  - "Roll Dice" button management
  - Rolls all dice in effect descriptions
  - Converts dropdowns to plain text after rolling
  - Handles "kh1" (keep highest) dice notation

### Manager Modules

#### `UIManager` (`src/managers/UIManager.js`)

- **Responsibility**: Manages UI interactions
- **Methods**:
  - `setup(onDrawCards, onDeckSizeChange)` - Initializes UI and event listeners
  - `isValidCardCount(count)` - Validates card count input

### Utility Modules

#### `rng` (`src/utils/rng.js`)

- **Responsibility**: Provides singleton random number generator
- **Features**:
  - Wraps `pure-rand` library
  - Provides `random()` function for consistent RNG
  - Used throughout codebase instead of `Math.random()`

#### `diceRoller` (`src/utils/diceRoller.js`)

- **Responsibility**: Dice rolling utilities
- **Functions**:
  - `parseDiceExpression(expression)` - Parses dice notation (e.g., "2d10", "3d12kh1")
  - `rollDiceExpression(expression)` - Rolls dice and returns result
  - `rollDiceInText(text)` - Finds and rolls all dice in text

#### `stringUtils` (`src/utils/stringUtils.js`)

- **Responsibility**: String utility functions
- **Functions**:
  - `capitalizeFirst(str)` - Capitalizes first letter of string

### Main Module

#### `CardGame` (`src/main.js`)

- **Responsibility**: Orchestrates all game components
- **Responsibilities**:
  - Initializes all modules
  - Coordinates between modules
  - Handles game flow (draw cards, deck size changes)
  - Manages special card behaviors (Isolation, Mystery, Mischief)
  - Updates effects display

## Design Principles Applied

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Single Responsibility Principle**: Each class/module does one thing well
3. **Dependency Injection**: Modules receive dependencies through constructor parameters
4. **Component-Based Architecture**: Game is broken into reusable, testable components
5. **Clean Code**: Functions are small, focused, and well-named
6. **DRY (Don't Repeat Yourself)**: Code duplication eliminated through reusable modules
7. **State Management**: Clear separation between game state and UI state

## Module Size Guidelines

- **Target**: Each module should be < 300 lines
- **GameRenderer**: 297 lines (orchestrator, well within limit)
- **ScrollManager**: 342 lines (handles complete scrolling feature)
- **CardHoverManager**: 376 lines (handles complete hover interaction feature)
- **EffectRenderers**: 293 lines (handles all effect rendering logic)

## Key Architectural Decisions

### 1. Modularized GameRenderer

- **Before**: 789 lines handling everything
- **After**: Split into 3 focused managers
  - `ScrollManager`: 342 lines - scrolling logic
  - `CardHoverManager`: 376 lines - hover/interaction logic
  - `GameRenderer`: 297 lines - orchestration
- **Benefit**: Clear separation, easier maintenance, independent testing

### 2. Animation State Management

- Uses flags (`_isAnimating`, `_animationComplete`) to prevent conflicts
- Hover manager respects animation state
- Ensures smooth animations without interference

### 3. Effect Rendering Separation

- `EffectsRenderer`: Orchestrator
- `EffectRenderers`: Individual rendering functions
- `DiceRollHandler`: Dice-specific logic
- Allows easy addition of new card effects

### 4. Consistent RNG Usage

- All randomness uses `rng.js` instead of `Math.random()`
- Ensures consistent, testable randomness
- Better statistical distribution

## Benefits

- **Maintainability**: Changes to one module don't affect others
- **Testability**: Each module can be tested independently
- **Readability**: Clear structure makes code easy to understand
- **Scalability**: Easy to add new features (cards, effects, animations)
- **Reusability**: Modules can be reused in other projects
- **Performance**: Optimized rendering with PixiJS v8

## Code Quality

- **Linting**: ESLint with Prettier integration
- **Formatting**: Consistent code style enforced
- **Event Listener Cleanup**: Proper resource management
- **Memory Leak Prevention**: Animation cancellation, timeout management
- **Error Handling**: Graceful error handling throughout
