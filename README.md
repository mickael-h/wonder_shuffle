# Wonder Shuffle - Tarot Card Drawing Game

A tarot card drawing game built with PixiJS where you draw cards that have magical effects. Features animated card drawings, interactive hover effects, and a comprehensive effects system.

## Features

- **Deck Selection**: Choose between a 13-card or 22-card tarot deck
- **Card Drawing**: Draw 1-20 cards with animated distribution
- **Animated Cards**: Beautiful flip animations with golden glitter effects
- **Interactive Hover**: Cards respond to cursor proximity and can be hovered for full-size view
- **Card Effects**: Each card has unique magical effects that stack appropriately
- **Effects Display**: Organized display of active effects with dice rolling support
- **Special Card Behaviors**:
  - Isolation card stops all further draws
  - Mystery card triggers additional draws
  - Mischief card allows drawing 2 extra cards

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## How to Play

1. Select your deck size (13 cards or 22 cards)
2. Enter the number of cards you want to draw (1-20)
3. Click "Draw Cards" to draw that many cards
4. Cards will animate into view with a flip animation
5. Hover over cards to see them at full size
6. View your active effects below the cards
7. Click "Roll Dice" to roll all dice in effect descriptions

## Special Card Behaviors

- **Isolation**: Stops all further card draws when drawn (but keeps previously drawn cards)
- **Mystery**: Automatically triggers an additional draw (ignores max draw limit)
- **Mischief**: Provides a "Draw x2" button to draw 2 additional cards

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Code Quality

Format and lint the code:

```bash
npm run format    # Format code with Prettier
npm run lint      # Lint code with ESLint
npm run check     # Run both format check and lint
```

## Technologies

- **PixiJS 8.x** - 2D WebGL renderer for interactive graphics and animations
- **Vite** - Fast build tool and dev server
- **pure-rand** - High-quality random number generation
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Architecture

The codebase follows Clean Code principles with a modular architecture:

- **Core**: PixiJS application initialization
- **Models**: Deck management and card effects logic
- **Renderers**: Visual rendering and animation (cards, scrolling, hover effects, effects display)
- **Managers**: UI interactions
- **Utils**: Utility functions (RNG, dice rolling, string helpers)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Project Structure

```
src/
├── constants.js              # Configuration constants
├── main.js                   # Main game orchestrator
├── core/                     # Core initialization
├── models/                   # Game logic (deck, effects)
├── renderers/                # Visual rendering
│   └── effectRenderers/      # Effect-specific rendering
├── managers/                 # UI management
└── utils/                    # Utility functions
```
