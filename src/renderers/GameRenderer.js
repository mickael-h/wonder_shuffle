import {
  CARD_CONFIG,
  ANIMATION_CONSTANTS,
  LAYOUT_CONSTANTS,
} from "../constants.js";
import { CardAnimator } from "./CardAnimator.js";
import { ScrollManager } from "./ScrollManager.js";
import { CardHoverManager } from "./CardHoverManager.js";

/**
 * Handles rendering cards on the game canvas with animations
 * Orchestrates scrolling and hover managers
 */
export class GameRenderer {
  constructor(app, cardRenderer) {
    this.app = app;
    this.cardRenderer = cardRenderer;
    this.cardSprites = [];
    // Cards displayed at 40% size
    this.cardScale = 0.4;
    this.cardWidth = CARD_CONFIG.WIDTH * this.cardScale;
    this.cardHeight = CARD_CONFIG.HEIGHT * this.cardScale;
    // Spacing between cards: proportional to card width
    this.cardSpacing = this.cardWidth * LAYOUT_CONSTANTS.CARD_SPACING_RATIO;
    this.cardsPerRow = LAYOUT_CONSTANTS.CARDS_PER_ROW;

    // Track active render operations to prevent race conditions
    this.activeRenderTimeouts = [];
    this.activeResizeTimeout = null;

    // Initialize managers
    this.scrollManager = new ScrollManager(app, app.stage);
    this.scrollContainer = this.scrollManager.setup();

    this.hoverManager = new CardHoverManager(
      this.scrollContainer,
      app,
      this.cardScale
    );
    this.hoverManager.setup();

    // Add hover manager update to ticker
    this.hoverUpdateCallback = () => {
      this.hoverManager.update(this.cardSprites);
    };
    this.app.ticker.add(this.hoverUpdateCallback);
  }

  /**
   * Renders cards on the canvas with animations
   * @param {Array} cardNames - Array of card name strings to render
   * @returns {Promise<void>}
   */
  async renderCards(cardNames) {
    if (!this.isValidApp()) {
      console.error("Cannot render cards: PixiJS application not initialized");
      return;
    }

    this.clearCards();
    this.scrollManager.resetPosition();
    this.hoverManager.reset();

    if (!cardNames || cardNames.length === 0) {
      return;
    }

    // Calculate required height for the canvas based on number of cards
    const rows = Math.ceil(cardNames.length / this.cardsPerRow);
    let totalHeight =
      rows * (this.cardHeight + this.cardSpacing) +
      ANIMATION_CONSTANTS.CANVAS_PADDING;

    // Ensure game area is at least full card height (for 1 row or when cards are hovered at 100% scale)
    // This prevents overflow when cards are hovered and scaled to 100%
    const minHeight =
      CARD_CONFIG.HEIGHT + ANIMATION_CONSTANTS.CANVAS_PADDING_MIN;
    totalHeight = Math.max(totalHeight, minHeight);

    // Update canvas container and app height to fit all cards
    const container = document.getElementById("canvas-container");
    if (container) {
      container.style.height = `${totalHeight}px`;
      // Wait for layout update before resizing PixiJS and rendering cards
      // Cancel any previous resize timeout to prevent race conditions
      if (this.activeResizeTimeout !== null) {
        clearTimeout(this.activeResizeTimeout);
      }

      this.activeResizeTimeout = setTimeout(() => {
        this.activeResizeTimeout = null;
        const containerRect = container.getBoundingClientRect();
        if (containerRect.height > 0 && containerRect.width > 0) {
          this.app.renderer.resize(containerRect.width, containerRect.height);
          // Update mask after resize to match new canvas dimensions
          this.scrollManager.updateMask();

          // Store the actual dimensions used for position calculations
          // Use containerRect dimensions directly to ensure consistency
          const canvasWidth = containerRect.width;
          const canvasHeight = containerRect.height;

          // Now calculate positions and render cards after resize is complete
          // Pass the actual canvas dimensions to ensure consistent coordinate system
          const positions = this.calculateCardPositions(
            cardNames.length,
            canvasWidth,
            canvasHeight
          );

          // Calculate total width for scrolling bounds (centered grid uses viewport width)
          const totalWidth = this.app.screen.width;

          // Store content width for scrolling calculations
          if (this.scrollContainer) {
            // Use a property to track content width since Container doesn't have width/height
            this.scrollContainer.contentWidth = totalWidth;
          }

          // Create and animate cards sequentially with delays
          // Track timeouts so they can be cancelled if needed
          for (let i = 0; i < cardNames.length; i++) {
            const cardName = cardNames[i];
            const delay = i * ANIMATION_CONSTANTS.CARD_ANIMATION_DELAY;

            const timeoutId = setTimeout(async () => {
              // Remove from active timeouts when executed
              const index = this.activeRenderTimeouts.indexOf(timeoutId);
              if (index > -1) {
                this.activeRenderTimeouts.splice(index, 1);
              }

              const frontSprite = await this.cardRenderer.createCardSprite(
                cardName,
                false
              );
              const backSprite = await this.cardRenderer.createCardSprite(
                cardName,
                true
              );

              if (!frontSprite || !backSprite) {
                console.warn("Failed to create card sprites at index", i);
                return;
              }

              // Target positions account for centered sprite anchor (0.5, 0.5)
              // positions[i] is top-left, but sprites are centered, so add half dimensions
              const targetX = positions[i].x + this.cardWidth / 2;
              const targetY = positions[i].y + this.cardHeight / 2;

              // Calculate animation center point to match the grid's coordinate system
              // The grid is centered in canvasHeight, so the center should match grid center
              const rows = Math.ceil(cardNames.length / this.cardsPerRow);
              const rowHeight = this.cardHeight + this.cardSpacing;
              const gridHeight = rows * rowHeight - this.cardSpacing;
              const gridCenterY =
                (canvasHeight - gridHeight) / 2 + gridHeight / 2;

              const currentCenterX = canvasWidth / 2;
              const currentCenterY = gridCenterY;

              const animatedCard = CardAnimator.createAnimatedCard(
                frontSprite,
                backSprite,
                currentCenterX,
                currentCenterY,
                targetX,
                targetY,
                this.cardScale
              );

              // Store original position (target position is where card will end up after animation)
              animatedCard.originalX = targetX;
              animatedCard.originalY = targetY;

              if (this.scrollContainer) {
                this.scrollContainer.addChild(animatedCard);
                this.cardSprites.push(animatedCard);

                // Auto-pan right to keep cards visible
                this.autoPanToCard(i, positions, totalWidth);
              }
            }, delay);

            this.activeRenderTimeouts.push(timeoutId);
          }
        }
      }, 0);
    }
  }

  /**
   * Clears all rendered cards from the canvas
   */
  clearCards() {
    // Cancel any pending render timeouts to prevent race conditions
    this.cancelActiveRenderTimeouts();

    // Stop all hover animations before removing cards
    this.cardSprites.forEach((cardContainer) => {
      CardAnimator.stopHoverAnimation(cardContainer);
    });

    if (this.scrollContainer) {
      this.scrollContainer.removeChildren();
    }
    this.cardSprites = [];
    this.hoverManager.reset();
  }

  /**
   * Cancels all active render timeouts to prevent race conditions
   */
  cancelActiveRenderTimeouts() {
    this.activeRenderTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.activeRenderTimeouts = [];

    if (this.activeResizeTimeout !== null) {
      clearTimeout(this.activeResizeTimeout);
      this.activeResizeTimeout = null;
    }
  }

  /**
   * Calculates positions for cards in a grid layout (max 5 per row)
   * Cards are positioned left to right, top to bottom
   * @param {number} cardCount - Number of cards to position
   * @param {number} canvasWidth - Canvas width to use for calculations
   * @param {number} canvasHeight - Canvas height to use for calculations
   * @returns {Array} Array of position objects with x and y coordinates
   */
  calculateCardPositions(cardCount, canvasWidth, canvasHeight) {
    const rowHeight = this.cardHeight + this.cardSpacing;

    // Calculate number of rows needed
    const rows = Math.ceil(cardCount / this.cardsPerRow);

    // Center the grid vertically using the provided canvas height
    const totalHeight = rows * rowHeight - this.cardSpacing;
    const startY = (canvasHeight - totalHeight) / 2;

    const positions = [];
    for (let i = 0; i < cardCount; i++) {
      const row = Math.floor(i / this.cardsPerRow);
      const col = i % this.cardsPerRow;

      // Calculate position within row (centered if row has fewer than 5 cards)
      const cardsInRow = Math.min(
        cardCount - row * this.cardsPerRow,
        this.cardsPerRow
      );
      const rowWidthActual =
        cardsInRow * (this.cardWidth + this.cardSpacing) - this.cardSpacing;
      const rowStartX = (canvasWidth - rowWidthActual) / 2;

      positions.push({
        x: rowStartX + col * (this.cardWidth + this.cardSpacing),
        y: startY + row * rowHeight,
      });
    }

    return positions;
  }

  /**
   * Auto-pans the viewport to keep the newly drawn card visible (disabled for grid layout)
   * @param {number} cardIndex - Index of the card that was just drawn
   * @param {Array} positions - Array of card positions
   * @param {number} totalWidth - Total width of all cards
   */
  autoPanToCard(_cardIndex, _positions, _totalWidth) {
    // Auto-pan disabled for grid layout since cards are centered
    // Cards should remain visible in the viewport
  }

  /**
   * Validates that the PixiJS app is initialized
   * @returns {boolean} True if app is valid
   */
  isValidApp() {
    return this.app && this.app.stage;
  }

  /**
   * Cleans up resources and event listeners
   */
  cleanup() {
    if (this.app && this.app.ticker && this.hoverUpdateCallback) {
      this.app.ticker.remove(this.hoverUpdateCallback);
    }
    this.scrollManager.cleanup();
    this.hoverManager.cleanup();
  }
}
