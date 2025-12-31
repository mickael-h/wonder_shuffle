# Wonder Shuffle - Card Drawing Game

A simple card drawing game built with PixiJS where you can announce a number of cards and draw them from a standard 52-card deck.

## Features

- Draw any number of cards from a shuffled deck
- Visual card representation using PixiJS
- Reset deck functionality
- Real-time deck status updates

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

1. Enter the number of cards you want to draw (1-52)
2. Click "Draw Cards" to draw that many cards from the deck
3. The drawn cards will be displayed on the canvas
4. Click "Reset Deck" to shuffle a fresh deck of 52 cards

## Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies

- PixiJS 8.x - 2D WebGL renderer for interactive graphics
- Vite - Fast build tool and dev server

