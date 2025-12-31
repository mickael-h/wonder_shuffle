import { CARD_CONFIG, ANIMATION_CONSTANTS } from "../constants.js";
import { CardAnimator } from "./CardAnimator.js";

/**
 * Handles cursor tracking, hover detection, and card interaction effects
 * Manages card rotation, scaling, and hover animations
 */
export class CardHoverManager {
  constructor(scrollContainer, app, cardScale) {
    this.scrollContainer = scrollContainer;
    this.app = app;
    this.cardScale = cardScale;

    // Cursor tracking
    this.cursorX = 0;
    this.cursorY = 0;
    this.hoveredCard = null;

    // Store bound event handlers for cleanup
    this.boundHandlers = {
      onMouseMove: (event) => {
        const rect = this.app.canvas.getBoundingClientRect();
        this.cursorX = event.clientX - rect.left;
        this.cursorY = event.clientY - rect.top;
      },
      onMouseLeave: () => {
        this.cursorX = -1;
        this.cursorY = -1;
      },
      // update method will be called directly, not from ticker
    };
  }

  /**
   * Sets up cursor tracking and adds update to ticker
   */
  setup() {
    if (!this.app || !this.app.canvas) {
      return;
    }

    // Track cursor position
    this.app.canvas.addEventListener(
      "mousemove",
      this.boundHandlers.onMouseMove
    );

    // When cursor leaves, reset cursor position
    this.app.canvas.addEventListener(
      "mouseleave",
      this.boundHandlers.onMouseLeave
    );

    // Note: updateCardRotations is not added to ticker here
    // It should be called manually with cardSprites from GameRenderer
  }

  /**
   * Updates card rotations and hover effects based on cursor position
   * Should be called from GameRenderer ticker with cardSprites
   * @param {Array} cardSprites - Array of card containers
   */
  update(cardSprites) {
    if (!this.scrollContainer || !cardSprites || cardSprites.length === 0) {
      return;
    }

    // Store base scale and original position if not already stored
    // Skip cards that are currently animating
    cardSprites.forEach((cardContainer) => {
      // Skip cards that are currently animating to avoid interference
      if (cardContainer._isAnimating) {
        return;
      }

      if (cardContainer.baseScaleX === undefined) {
        cardContainer.baseScaleX = this.cardScale;
        cardContainer.baseScaleY = this.cardScale;
      }
      // Store original position only if not already stored AND card has completed animation
      // Check if originalX/Y are already set (set in GameRenderer after animation setup)
      // Do NOT capture position during animation as it will interfere with the animation
      if (cardContainer.originalX === undefined && cardContainer._animationComplete) {
        cardContainer.originalX = cardContainer.x;
        cardContainer.originalY = cardContainer.y;
      }
    });

    // If cursor is outside canvas, reset all cards (except those animating)
    if (this.cursorX < 0 || this.cursorY < 0) {
      cardSprites.forEach((cardContainer) => {
        if (!cardContainer._isAnimating) {
          this.resetCardToOriginal(cardContainer);
        }
      });
      this.hoveredCard = null;
      return;
    }

    // Find which card is being hovered (check original positions, not visual positions)
    const scrollOffsetX = this.scrollContainer.x;
    const newHoveredCard = this.detectHoveredCard(
      cardSprites,
      scrollOffsetX
    );

    // Update hovered card state
    if (newHoveredCard !== this.hoveredCard) {
      // Reset previously hovered card
      if (this.hoveredCard) {
        CardAnimator.stopHoverAnimation(this.hoveredCard);
        this.resetCardToOriginal(this.hoveredCard);
        // Restart hover animation when card is no longer hovered
        if (this.hoveredCard.originalY !== undefined) {
          CardAnimator.startHoverAnimation(
            this.hoveredCard,
            this.hoveredCard.originalY
          );
        } else {
          CardAnimator.startHoverAnimation(this.hoveredCard);
        }
      }
      // Stop hover animation on newly hovered card
      if (newHoveredCard) {
        CardAnimator.stopHoverAnimation(newHoveredCard);
      }
      this.hoveredCard = newHoveredCard;
    }

    // Handle hovered card: move slightly toward center to prevent overflow and scale to 100%
    if (this.hoveredCard) {
      this.updateHoveredCard();
    }

    // Handle non-hovered cards: reset to original position and apply proximity scaling
    // Only if animation is complete (don't interfere with flip animation)
    cardSprites.forEach((cardContainer) => {
      // Skip cards that are currently animating
      if (cardContainer._isAnimating) {
        return;
      }
      
      if (cardContainer === this.hoveredCard) {
        return; // Skip hovered card
      }

      // Only reset if animation is complete
      if (cardContainer._animationComplete) {
        this.resetCardToOriginal(cardContainer);
        this.applyProximityScaling(cardContainer, scrollOffsetX);
      }
    });
  }

  /**
   * Detects which card is being hovered
   * @private
   * @param {Array} cardSprites - Array of card containers
   * @param {number} scrollOffsetX - Current scroll offset
   * @returns {Container|null} The hovered card container or null
   */
  detectHoveredCard(cardSprites, scrollOffsetX) {
    let newHoveredCard = null;
    let minDistance = Infinity;

    cardSprites.forEach((cardContainer) => {
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

    return newHoveredCard;
  }

  /**
   * Updates the hovered card position and scale
   * @private
   */
  updateHoveredCard() {
    // Get actual screen height (should match container height)
    const screenHeight = this.app.screen.height;
    const cardFullHeight = CARD_CONFIG.HEIGHT; // 560px at 100% scale
    const halfCardHeight = cardFullHeight / 2; // 280px

    // Get card's original position
    const originalX = this.hoveredCard.originalX;
    const originalY = this.hoveredCard.originalY;

    // Calculate safe bounds: targetY must ensure card doesn't overflow
    // Top constraint: targetY - halfCardHeight >= 0 => targetY >= halfCardHeight
    const minY = halfCardHeight;
    // Bottom constraint: targetY + halfCardHeight <= screenHeight => targetY <= screenHeight - halfCardHeight
    const maxY = screenHeight - halfCardHeight;

    // Only adjust Y position if the card would overflow at original position
    // Move toward center just enough to fit, but don't move all the way to center
    let targetY = originalY;
    if (originalY < minY) {
      // Card too high, move down just enough to fit
      targetY = minY;
    } else if (originalY > maxY) {
      // Card too low, move up just enough to fit
      targetY = maxY;
    }

    // X position: move slightly toward center but not all the way
    const centerX = this.app.screen.width / 2;
    const currentX = this.hoveredCard.x;
    // Move 30% toward center (subtle adjustment)
    const targetX = originalX + (centerX - originalX) * 0.3;

    // Smoothly move to adjusted position
    const currentY = this.hoveredCard.y;
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

  /**
   * Applies proximity-based scaling to non-hovered cards
   * @private
   * @param {Container} cardContainer - Card container to apply scaling to
   * @param {number} scrollOffsetX - Current scroll offset
   */
  applyProximityScaling(cardContainer, scrollOffsetX) {
    // Get card position in screen space (accounting for scroll container)
    const originalX = cardContainer.originalX;
    const originalY = cardContainer.originalY;
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

    // Restart hover animation if it was stopped and card is not hovered
    if (
      cardContainer._hoverAnimationId === undefined &&
      this.hoveredCard !== cardContainer
    ) {
      CardAnimator.startHoverAnimation(cardContainer);
    }
  }

  /**
   * Resets hover state
   */
  reset() {
    this.hoveredCard = null;
  }

  /**
   * Cleans up event listeners and resources
   */
  cleanup() {
    if (this.app && this.app.canvas) {
      this.app.canvas.removeEventListener(
        "mousemove",
        this.boundHandlers.onMouseMove
      );
      this.app.canvas.removeEventListener(
        "mouseleave",
        this.boundHandlers.onMouseLeave
      );
    }
    // No ticker callback to remove - update is called manually
  }
}

