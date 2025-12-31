import { CARD_CONFIG, CANVAS_CONFIG } from "../constants.js";

/**
 * Handles rendering cards on the game canvas
 */
export class GameRenderer {
  constructor(app, cardRenderer) {
    this.app = app;
    this.cardRenderer = cardRenderer;
    this.cardSprites = [];
    this.cardWidth = CARD_CONFIG.WIDTH;
    this.cardHeight = CARD_CONFIG.HEIGHT;
    this.cardSpacing = CARD_CONFIG.SPACING;
    this.minCanvasWidth = CANVAS_CONFIG.WIDTH;
  }

  /**
   * Renders cards on the canvas
   * @param {Array} cardNames - Array of card name strings to render
   * @returns {Promise<void>}
   */
  async renderCards(cardNames) {
    if (!this.isValidApp()) {
      console.error("Cannot render cards: PixiJS application not initialized");
      return;
    }

    this.clearCards();
    this.resetScrollPosition();

    if (!cardNames || cardNames.length === 0) {
      // Reset canvas width when no cards
      this.updateCanvasWidth(0);
      return;
    }

    const positions = this.calculateCardPositions(cardNames.length);

    // Calculate total width needed for all cards
    const lastCardIndex = cardNames.length - 1;
    const totalWidth = positions[lastCardIndex].x + this.cardWidth + 20; // 20 is padding
    this.updateCanvasWidth(totalWidth);

    // Create all card graphics in parallel
    const cardGraphicsPromises = cardNames.map((cardName, index) =>
      this.cardRenderer.createCardGraphic(cardName).then((cardGraphic) => ({
        cardGraphic,
        index,
      }))
    );

    const cardGraphics = await Promise.all(cardGraphicsPromises);

    cardGraphics.forEach(({ cardGraphic, index }) => {
      if (!cardGraphic) {
        console.warn("Failed to create card graphic at index", index);
        return;
      }

      cardGraphic.x = positions[index].x;
      cardGraphic.y = positions[index].y;
      this.app.stage.addChild(cardGraphic);
      this.cardSprites.push(cardGraphic);
    });
  }

  /**
   * Updates the canvas width to accommodate all cards for scrolling
   * @param {number} totalWidth - Total width needed for all cards (0 to reset to minimum)
   */
  updateCanvasWidth(totalWidth) {
    const canvas = this.app.canvas;
    if (!canvas) return;

    const newWidth =
      totalWidth === 0
        ? this.minCanvasWidth
        : Math.max(this.minCanvasWidth, totalWidth);
    this.app.renderer.resize(newWidth, this.app.screen.height);
  }

  /**
   * Clears all rendered cards from the canvas
   */
  clearCards() {
    this.cardSprites.forEach((sprite) => {
      if (sprite && typeof sprite.destroy === "function") {
        sprite.destroy();
      }
    });
    this.cardSprites = [];
    this.app.stage.removeChildren();
  }

  /**
   * Calculates positions for cards on a single horizontal row
   * Cards are positioned left to right, allowing horizontal scrolling
   * @param {number} cardCount - Number of cards to position
   * @returns {Array} Array of position objects with x and y coordinates
   */
  calculateCardPositions(cardCount) {
    const canvasHeight = this.app.screen.height;
    const padding = 20;
    const startX = padding;
    const startY = (canvasHeight - this.cardHeight) / 2;

    const positions = [];
    for (let i = 0; i < cardCount; i++) {
      positions.push({
        x: startX + i * (this.cardWidth + this.cardSpacing),
        y: startY,
      });
    }

    return positions;
  }

  /**
   * Resets the scrollbar position to the left
   */
  resetScrollPosition() {
    const container = document.getElementById("canvas-container");
    if (container) {
      container.scrollLeft = 0;
    }
  }

  /**
   * Validates that the PixiJS app is initialized
   * @returns {boolean} True if app is valid
   */
  isValidApp() {
    return this.app && this.app.stage;
  }
}
