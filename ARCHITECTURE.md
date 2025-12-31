# Game Architecture

This document describes the modular architecture of the Wonder Shuffle card game.

## Project Structure

```
src/
├── constants.js              # Configuration constants
├── main.js                   # Main game orchestrator (127 lines)
├── core/
│   └── AppInitializer.js    # PixiJS application initialization
├── models/
│   └── DeckManager.js       # Deck management (creation, shuffling, drawing)
├── renderers/
│   ├── CardRenderer.js      # Individual card graphic rendering
│   └── GameRenderer.js      # Canvas rendering and card positioning
└── managers/
    └── UIManager.js         # UI interactions and status updates
```

## Module Responsibilities

### Core Modules

#### `AppInitializer` (`src/core/AppInitializer.js`)
- **Responsibility**: Initializes PixiJS Application instance
- **Responsibilities**:
  - Creates and configures PixiJS Application
  - Attaches canvas to DOM
  - Error handling for initialization

### Model Modules

#### `DeckManager` (`src/models/DeckManager.js`)
- **Responsibility**: Manages deck operations
- **Methods**:
  - `createDeck()` - Creates a standard 52-card deck
  - `shuffleDeck()` - Shuffles deck using Fisher-Yates algorithm
  - `drawCards(count)` - Draws specified number of cards
  - `getDeckSize()` - Returns remaining cards in deck
  - `isEmpty()` - Checks if deck is empty
  - `reset()` - Resets deck to full shuffled deck

### Renderer Modules

#### `CardRenderer` (`src/renderers/CardRenderer.js`)
- **Responsibility**: Creates individual card graphics
- **Methods**:
  - `createCardGraphic(card)` - Creates complete card container
  - `createCardBackground()` - Creates card background graphic
  - `getSuitColor(suit)` - Determines color for suit
  - Helper methods for creating rank and suit text elements

#### `GameRenderer` (`src/renderers/GameRenderer.js`)
- **Responsibility**: Handles rendering cards on canvas
- **Dependencies**: Requires PixiJS app and CardRenderer
- **Methods**:
  - `renderCards(cards)` - Renders array of cards on canvas
  - `clearCards()` - Clears all cards from canvas
  - `calculateCardPositions(count)` - Calculates centered positions for cards

### Manager Modules

#### `UIManager` (`src/managers/UIManager.js`)
- **Responsibility**: Manages UI interactions and status updates
- **Methods**:
  - `setup(onDrawCards, onResetDeck)` - Initializes UI and event listeners
  - `updateStatus(message, type)` - Updates status message display
  - `isValidCardCount(count)` - Validates card count input

### Main Module

#### `CardGame` (`src/main.js`)
- **Responsibility**: Orchestrates all game components
- **Responsibilities**:
  - Initializes all modules
  - Coordinates between modules
  - Handles game flow (draw cards, reset deck)
  - Error handling

## Design Principles Applied

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Single Responsibility Principle**: Each class/module does one thing well
3. **Dependency Injection**: Modules receive dependencies through constructor parameters
4. **Component-Based Architecture**: Game is broken into reusable, testable components
5. **Clean Code**: Functions are small, focused, and well-named
6. **DRY (Don't Repeat Yourself)**: Code duplication eliminated through reusable modules

## Benefits

- **Maintainability**: Changes to one module don't affect others
- **Testability**: Each module can be tested independently
- **Readability**: Clear structure makes code easy to understand
- **Scalability**: Easy to add new features (e.g., animations, sound, new card types)
- **Reusability**: Modules can be reused in other projects

## Size Reduction

- **Before**: 313 lines in single file
- **After**: 127 lines in main.js + well-organized modules
- **Reduction**: ~60% reduction in main file size

