import { Container, Graphics } from "pixi.js";
import {
  CARD_CONFIG,
  ANIMATION_CONSTANTS,
  LAYOUT_CONSTANTS,
} from "../constants.js";
import { CardAnimator } from "./CardAnimator.js";

/**
 * Handles rendering cards on the game canvas with animations and scrolling
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

    // Scrolling setup
    this.scrollContainer = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.scrollStartX = 0;
    this.scrollVelocity = 0;
    this.lastScrollTime = 0;
    this.lastScrollX = 0;

    // Cursor tracking for card rotation and hover
    this.cursorX = 0;
    this.cursorY = 0;
    this.hoveredCard = null; // Currently hovered card container

    // Track active render operations to prevent race conditions
    this.activeRenderTimeouts = [];
    this.activeResizeTimeout = null;

    // Store bound event handlers for cleanup
    this.boundHandlers = {
      onDragStart: this.onDragStart.bind(this),
      onDragMove: this.onDragMove.bind(this),
      onDragEnd: this.onDragEnd.bind(this),
      onTouchStart: this.onTouchStart.bind(this),
      onTouchMove: this.onTouchMove.bind(this),
      onTouchEnd: this.onTouchEnd.bind(this),
      onResize: () => {
        if (this.app && this.scrollContainer) {
          this.updateMask();
        }
      },
      onMouseMove: (event) => {
        const rect = this.app.canvas.getBoundingClientRect();
        this.cursorX = event.clientX - rect.left;
        this.cursorY = event.clientY - rect.top;
      },
      onMouseLeave: () => {
        this.cursorX = -1;
        this.cursorY = -1;
      },
    };

    this.setupScrolling();
    this.setupCursorTracking();
  }

  /**
   * Sets up PixiJS-based scrolling
   */
  setupScrolling() {
    if (!this.app || !this.app.stage) {
      return;
    }

    // Create a container for all cards (this will scroll)
    this.scrollContainer = new Container();
    this.scrollContainer.sortableChildren = true; // Enable z-index sorting
    this.app.stage.addChild(this.scrollContainer);

    // Add mask to viewport
    this.updateMask();

    // Mouse/touch event handlers for dragging (using bound handlers for cleanup)
    this.app.canvas.addEventListener(
      "mousedown",
      this.boundHandlers.onDragStart
    );
    this.app.canvas.addEventListener(
      "mousemove",
      this.boundHandlers.onDragMove
    );
    this.app.canvas.addEventListener("mouseup", this.boundHandlers.onDragEnd);
    this.app.canvas.addEventListener(
      "mouseleave",
      this.boundHandlers.onDragEnd
    );

    // Touch events
    this.app.canvas.addEventListener(
      "touchstart",
      this.boundHandlers.onTouchStart
    );
    this.app.canvas.addEventListener(
      "touchmove",
      this.boundHandlers.onTouchMove
    );
    this.app.canvas.addEventListener("touchend", this.boundHandlers.onTouchEnd);

    // Smooth scrolling with momentum
    this.app.ticker.add(this.updateScroll.bind(this));

    // Handle canvas resize to update mask
    window.addEventListener("resize", this.boundHandlers.onResize);
  }

  /**
   * Sets up cursor tracking for card rotation
   */
  setupCursorTracking() {
    if (!this.app || !this.app.canvas) {
      return;
    }

    // Track cursor position (using bound handlers for cleanup)
    this.app.canvas.addEventListener(
      "mousemove",
      this.boundHandlers.onMouseMove
    );

    // When cursor leaves, reset cursor position
    this.app.canvas.addEventListener(
      "mouseleave",
      this.boundHandlers.onMouseLeave
    );

    // Add card rotation update to ticker
    this.app.ticker.add(this.updateCardRotations.bind(this));
  }

  /**
   * Updates card rotations and hover effects based on cursor position
   * Simulates Y-axis rotation by adjusting scale, and moves hovered cards to center
   */
  updateCardRotations() {
    if (!this.scrollContainer || this.cardSprites.length === 0) {
      return;
    }

    // Store base scale and original position if not already stored
    this.cardSprites.forEach((cardContainer) => {
      if (cardContainer.baseScaleX === undefined) {
        cardContainer.baseScaleX = this.cardScale;
        cardContainer.baseScaleY = this.cardScale;
      }
      // Store original position if not stored (after animation completes)
      if (cardContainer.originalX === undefined) {
        cardContainer.originalX = cardContainer.x;
        cardContainer.originalY = cardContainer.y;
      }
    });

    // If cursor is outside canvas, reset all cards
    if (this.cursorX < 0 || this.cursorY < 0) {
      this.cardSprites.forEach((cardContainer) => {
        this.resetCardToOriginal(cardContainer);
      });
      this.hoveredCard = null;
      return;
    }

    // Find which card is being hovered (check original positions, not visual positions)
    let newHoveredCard = null;
    let minDistance = Infinity;

    this.cardSprites.forEach((cardContainer) => {
      // Use original position for detection (not current visual position)
      const originalX = cardContainer.originalX;
      const originalY = cardContainer.originalY;

      // Get card bounds at original position with base scale
      const cardWidth = CARD_CONFIG.WIDTH * this.cardScale;
      const cardHeight = CARD_CONFIG.HEIGHT * this.cardScale;

      // Check if cursor is within card bounds (using original position)
      const cardLeft = originalX - cardWidth / 2;
      const cardRight = originalX + cardWidth / 2;
      const cardTop = originalY - cardHeight / 2;
      const cardBottom = originalY + cardHeight / 2;

      // Account for scroll container position
      const scrollOffsetX = this.scrollContainer.x;
      const adjustedCardLeft = cardLeft + scrollOffsetX;
      const adjustedCardRight = cardRight + scrollOffsetX;

      if (
        this.cursorX >= adjustedCardLeft &&
        this.cursorX <= adjustedCardRight &&
        this.cursorY >= cardTop &&
        this.cursorY <= cardBottom
      ) {
        // Cursor is within this card's bounds
        const dx = this.cursorX - originalX - scrollOffsetX;
        const dy = this.cursorY - originalY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          newHoveredCard = cardContainer;
        }
      }
    });

    // Update hovered card
    if (newHoveredCard !== this.hoveredCard) {
      // Reset previously hovered card
      if (this.hoveredCard) {
        // Stop hover animation before resetting (it will be restarted after reset)
        CardAnimator.stopHoverAnimation(this.hoveredCard);
        this.resetCardToOriginal(this.hoveredCard);
        // Restart hover animation when card is no longer hovered, using originalY as base
        if (this.hoveredCard.originalY !== undefined) {
          CardAnimator.startHoverAnimation(
            this.hoveredCard,
            this.hoveredCard.originalY
          );
        } else {
          CardAnimator.startHoverAnimation(this.hoveredCard);
        }
      }
      // Stop hover animation on newly hovered card (will be controlled by updateCardRotations)
      if (newHoveredCard) {
        CardAnimator.stopHoverAnimation(newHoveredCard);
      }
      this.hoveredCard = newHoveredCard;
    }

    // Handle hovered card: move to center and scale to 100%
    if (this.hoveredCard) {
      const centerX = this.app.screen.width / 2;

      // Get actual screen height (should match container height)
      const screenHeight = this.app.screen.height;
      const desiredCenterY = screenHeight / 2;

      // Calculate safe target Y position accounting for full-sized card
      // At 100% scale, card height is CARD_CONFIG.HEIGHT (560px)
      // Card is positioned by its center, so:
      //   - Top edge = targetY - (cardHeight/2)
      //   - Bottom edge = targetY + (cardHeight/2)
      // Note: Hover animation is stopped for hovered cards, so no need to account for it
      const cardFullHeight = CARD_CONFIG.HEIGHT; // 560px
      const halfCardHeight = cardFullHeight / 2; // 280px

      // Calculate bounds: targetY must ensure card doesn't overflow
      // Top constraint: targetY - halfCardHeight >= 0
      // => targetY >= halfCardHeight
      const minY = halfCardHeight;

      // Bottom constraint: targetY + halfCardHeight <= screenHeight
      // => targetY <= screenHeight - halfCardHeight
      const maxY = screenHeight - halfCardHeight;

      // Clamp target Y to safe bounds (ensure it's within [minY, maxY])
      const targetY = Math.max(minY, Math.min(maxY, desiredCenterY));

      // Smoothly move to center (both horizontally and vertically)
      const currentX = this.hoveredCard.x;
      const currentY = this.hoveredCard.y;
      const targetX = centerX;
      const easeFactor = ANIMATION_CONSTANTS.EASE_FACTOR_HOVER;
      this.hoveredCard.x = currentX + (targetX - currentX) * easeFactor;
      this.hoveredCard.y = currentY + (targetY - currentY) * easeFactor;

      // Scale to 100%
      const targetScale = 1.0;
      const currentScaleX = this.hoveredCard.scale.x;
      const currentScaleY = this.hoveredCard.scale.y;
      const scaleXDelta = targetScale - currentScaleX;
      const scaleYDelta = targetScale - currentScaleY;
      this.hoveredCard.scale.x = currentScaleX + scaleXDelta * easeFactor;
      this.hoveredCard.scale.y = currentScaleY + scaleYDelta * easeFactor;

      // Bring to front
      this.hoveredCard.zIndex = ANIMATION_CONSTANTS.HOVERED_CARD_ZINDEX;
    }

    // Handle non-hovered cards: reset to original position and apply proximity scaling
    this.cardSprites.forEach((cardContainer) => {
      if (cardContainer === this.hoveredCard) {
        return; // Skip hovered card
      }

      // Reset to original position if not already there
      this.resetCardToOriginal(cardContainer);

      // Get card position in screen space (accounting for scroll container)
      const originalX = cardContainer.originalX;
      const originalY = cardContainer.originalY;
      const scrollOffsetX = this.scrollContainer.x;
      const cardCenterX = originalX + scrollOffsetX;
      const cardCenterY = originalY;

      // Calculate distance from cursor to card center (in screen coordinates)
      const dx = this.cursorX - cardCenterX;
      const dy = this.cursorY - cardCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Maximum distance for full effect
      const maxDistance = ANIMATION_CONSTANTS.MAX_PROXIMITY_DISTANCE;
      const proximityFactor = Math.max(
        0,
        Math.min(1, 1 - distance / maxDistance)
      );

      // Calculate target scale based on horizontal position (simulating Y-axis rotation)
      // Closer cursor = larger scale (reverse effect)
      const maxScaleIncrease = ANIMATION_CONSTANTS.MAX_SCALE_INCREASE;
      const baseScaleX = cardContainer.baseScaleX;
      const baseScaleY = cardContainer.baseScaleY;
      const normalizedDx = distance > 0 ? dx / distance : 0;
      const targetScaleX =
        baseScaleX *
        (1 + proximityFactor * maxScaleIncrease * Math.abs(normalizedDx));
      const targetScaleY =
        baseScaleY *
        (1 + proximityFactor * maxScaleIncrease * Math.abs(normalizedDx));

      // Smoothly animate to target scale with ease out
      const currentScaleX = cardContainer.scale.x;
      const currentScaleY = cardContainer.scale.y;
      const scaleXDelta = targetScaleX - currentScaleX;
      const scaleYDelta = targetScaleY - currentScaleY;
      const easeFactor = ANIMATION_CONSTANTS.EASE_FACTOR_PROXIMITY;
      cardContainer.scale.x = currentScaleX + scaleXDelta * easeFactor;
      cardContainer.scale.y = currentScaleY + scaleYDelta * easeFactor;

      // Reset z-index for non-hovered cards
      cardContainer.zIndex = 0;
    });
  }

  /**
   * Resets a card to its original position and scale
   * @param {Container} cardContainer - Card container to reset
   */
  resetCardToOriginal(cardContainer) {
    if (
      cardContainer.originalX === undefined ||
      cardContainer.originalY === undefined
    ) {
      return;
    }

    const easeFactor = ANIMATION_CONSTANTS.EASE_FACTOR_RESET;
    const currentX = cardContainer.x;
    const currentY = cardContainer.y;
    const targetX = cardContainer.originalX;
    const targetY = cardContainer.originalY;
    cardContainer.x = currentX + (targetX - currentX) * easeFactor;
    cardContainer.y = currentY + (targetY - currentY) * easeFactor;

    const targetScaleX = cardContainer.baseScaleX || this.cardScale;
    const targetScaleY = cardContainer.baseScaleY || this.cardScale;
    const currentScaleX = cardContainer.scale.x;
    const currentScaleY = cardContainer.scale.y;
    const scaleXDelta = targetScaleX - currentScaleX;
    const scaleYDelta = targetScaleY - currentScaleY;
    cardContainer.scale.x = currentScaleX + scaleXDelta * easeFactor;
    cardContainer.scale.y = currentScaleY + scaleYDelta * easeFactor;

    cardContainer.zIndex = 0;
  }

  /**
   * Updates the viewport mask
   */
  updateMask() {
    if (!this.app || !this.scrollContainer) return;

    // Remove old mask if it exists
    if (this.scrollContainer.mask) {
      const oldMask = this.scrollContainer.mask;
      this.scrollContainer.mask = null;
      if (oldMask.parent) {
        oldMask.parent.removeChild(oldMask);
      }
    }

    // Create new mask
    const maskGraphics = new Graphics();
    maskGraphics
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill(0xffffff);

    this.scrollContainer.mask = maskGraphics;
    this.app.stage.addChild(maskGraphics);
  }

  /**
   * Mouse drag start
   */
  onDragStart(event) {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.scrollStartX = this.scrollContainer.x;
    this.scrollVelocity = 0;
  }

  /**
   * Mouse drag move
   */
  onDragMove(event) {
    if (!this.isDragging) return;
    event.preventDefault();

    const deltaX = event.clientX - this.dragStartX;
    this.scrollContainer.x = this.scrollStartX + deltaX;
    this.constrainScroll();
  }

  /**
   * Mouse drag end
   */
  onDragEnd(_event) {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Calculate velocity for momentum scrolling
    const now = Date.now();
    const deltaTime = now - this.lastScrollTime;
    if (deltaTime > 0) {
      const deltaX = this.scrollContainer.x - this.lastScrollX;
      this.scrollVelocity = (deltaX / deltaTime) * 16; // Normalize to 60fps
    }
  }

  /**
   * Touch start
   */
  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.scrollStartX = this.scrollContainer.x;
      this.scrollVelocity = 0;
    }
  }

  /**
   * Touch move
   */
  onTouchMove(event) {
    if (!this.isDragging || event.touches.length !== 1) return;
    event.preventDefault();

    const deltaX = event.touches[0].clientX - this.dragStartX;
    this.scrollContainer.x = this.scrollStartX + deltaX;
    this.constrainScroll();
  }

  /**
   * Touch end
   */
  onTouchEnd(_event) {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Calculate velocity for momentum scrolling
    const now = Date.now();
    const deltaTime = now - this.lastScrollTime;
    if (deltaTime > 0) {
      const deltaX = this.scrollContainer.x - this.lastScrollX;
      this.scrollVelocity = (deltaX / deltaTime) * 16;
    }
  }

  /**
   * Updates scroll momentum
   */
  updateScroll() {
    if (!this.scrollContainer) return;

    // Track scroll position for velocity calculation
    const now = Date.now();
    const deltaTime = now - this.lastScrollTime;
    if (deltaTime > 0 && !this.isDragging) {
      this.lastScrollX = this.scrollContainer.x;
      this.lastScrollTime = now;
    }

    // Apply momentum scrolling
    if (!this.isDragging && Math.abs(this.scrollVelocity) > 0.1) {
      this.scrollContainer.x += this.scrollVelocity;
      this.scrollVelocity *= 0.95; // Friction
      this.constrainScroll();
    }
  }

  /**
   * Constrains scroll position to valid bounds
   */
  constrainScroll() {
    if (!this.scrollContainer || !this.app) return;

    const contentWidth = this.scrollContainer.contentWidth || 0;
    const viewportWidth = this.app.screen.width;
    const maxScroll = 0;

    // Calculate minimum scroll (negative value)
    const minScroll = Math.min(0, viewportWidth - contentWidth);

    if (this.scrollContainer.x > maxScroll) {
      this.scrollContainer.x = maxScroll;
      this.scrollVelocity = 0;
    } else if (this.scrollContainer.x < minScroll) {
      this.scrollContainer.x = minScroll;
      this.scrollVelocity = 0;
    }
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
    this.resetScrollPosition();

    if (!cardNames || cardNames.length === 0) {
      return;
    }

    // Calculate required height for the canvas based on number of cards
    const rows = Math.ceil(cardNames.length / this.cardsPerRow);
    let totalHeight =
      rows * (this.cardHeight + this.cardSpacing) +
      ANIMATION_CONSTANTS.CANVAS_PADDING;

    // For draws of less than 5 cards, ensure game area is at least full card height
    // This prevents overflow when cards are hovered and scaled to 100%
    if (cardNames.length < 5) {
      const minHeight =
        CARD_CONFIG.HEIGHT + ANIMATION_CONSTANTS.CANVAS_PADDING_MIN;
      totalHeight = Math.max(totalHeight, minHeight);
    }

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
          if (this.scrollContainer) {
            this.updateMask();
          }

          // Now calculate positions and render cards after resize is complete
          const positions = this.calculateCardPositions(cardNames.length);

          // Calculate center point for animation (center of viewport)
          const centerX = this.app.screen.width / 2;
          const centerY = this.app.screen.height / 2;

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

              const animatedCard = CardAnimator.createAnimatedCard(
                frontSprite,
                backSprite,
                centerX,
                centerY,
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
    this.hoveredCard = null; // Reset hovered card
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
   * @returns {Array} Array of position objects with x and y coordinates
   */
  calculateCardPositions(cardCount) {
    const rowHeight = this.cardHeight + this.cardSpacing;

    // Calculate number of rows needed
    const rows = Math.ceil(cardCount / this.cardsPerRow);

    // Center the grid vertically
    const totalHeight = rows * rowHeight - this.cardSpacing;
    const startY = (this.app.screen.height - totalHeight) / 2;

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
      const rowStartX = (this.app.screen.width - rowWidthActual) / 2;

      positions.push({
        x: rowStartX + col * (this.cardWidth + this.cardSpacing),
        y: startY + row * rowHeight,
      });
    }

    return positions;
  }

  /**
   * Resets the scroll position to the left
   */
  resetScrollPosition() {
    if (this.scrollContainer) {
      this.scrollContainer.x = 0;
    }
    this.scrollVelocity = 0;
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
   * Smoothly scrolls to a target position
   * @param {number} targetX - Target scroll X position
   */
  smoothScrollTo(targetX) {
    if (!this.scrollContainer) return;

    const startX = this.scrollContainer.x;
    const distance = targetX - startX;
    const duration = ANIMATION_CONSTANTS.SMOOTH_SCROLL_DURATION;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.scrollContainer.x = startX + distance * easeOut;
      this.constrainScroll();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scrollVelocity = 0; // Reset velocity after smooth scroll
      }
    };

    animate();
  }

  /**
   * Validates that the PixiJS app is initialized
   * @returns {boolean} True if app is valid
   */
  isValidApp() {
    return this.app && this.app.stage;
  }
}
