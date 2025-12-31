import { Container, Graphics } from "pixi.js";
import { ANIMATION_CONSTANTS } from "../constants.js";

/**
 * Handles PixiJS-based scrolling for card display
 * Manages drag/touch interactions, momentum scrolling, and viewport masking
 */
export class ScrollManager {
  constructor(app, stage) {
    this.app = app;
    this.stage = stage;
    this.scrollContainer = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.scrollStartX = 0;
    this.scrollVelocity = 0;
    this.lastScrollTime = 0;
    this.lastScrollX = 0;

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
      updateScroll: this.updateScroll.bind(this),
    };
  }

  /**
   * Sets up scrolling by creating container, mask, and event listeners
   * @returns {Container} The scroll container
   */
  setup() {
    if (!this.app || !this.stage) {
      return null;
    }

    // Create a container for all cards (this will scroll)
    this.scrollContainer = new Container();
    this.scrollContainer.sortableChildren = true; // Enable z-index sorting
    this.stage.addChild(this.scrollContainer);

    // Add mask to viewport
    this.updateMask();

    // Mouse/touch event handlers for dragging
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
    this.app.ticker.add(this.boundHandlers.updateScroll);

    // Handle canvas resize to update mask
    window.addEventListener("resize", this.boundHandlers.onResize);

    return this.scrollContainer;
  }

  /**
   * Gets the scroll container
   * @returns {Container|null} The scroll container
   */
  getContainer() {
    return this.scrollContainer;
  }

  /**
   * Gets the current scroll offset (X position)
   * @returns {number} Current scroll offset
   */
  getScrollOffset() {
    return this.scrollContainer ? this.scrollContainer.x : 0;
  }

  /**
   * Resets the scroll position to the left
   */
  resetPosition() {
    if (this.scrollContainer) {
      this.scrollContainer.x = 0;
    }
    this.scrollVelocity = 0;
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
    this.stage.addChild(maskGraphics);
  }

  /**
   * Mouse drag start
   * @private
   */
  onDragStart(event) {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.scrollStartX = this.scrollContainer.x;
    this.scrollVelocity = 0;
  }

  /**
   * Mouse drag move
   * @private
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
   * @private
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
   * @private
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
   * @private
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
   * @private
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
   * Updates scroll momentum (called by ticker)
   * @private
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
   * @private
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
   * Cleans up event listeners and resources
   */
  cleanup() {
    if (this.app && this.app.canvas) {
      this.app.canvas.removeEventListener(
        "mousedown",
        this.boundHandlers.onDragStart
      );
      this.app.canvas.removeEventListener(
        "mousemove",
        this.boundHandlers.onDragMove
      );
      this.app.canvas.removeEventListener(
        "mouseup",
        this.boundHandlers.onDragEnd
      );
      this.app.canvas.removeEventListener(
        "mouseleave",
        this.boundHandlers.onDragEnd
      );
      this.app.canvas.removeEventListener(
        "touchstart",
        this.boundHandlers.onTouchStart
      );
      this.app.canvas.removeEventListener(
        "touchmove",
        this.boundHandlers.onTouchMove
      );
      this.app.canvas.removeEventListener(
        "touchend",
        this.boundHandlers.onTouchEnd
      );
    }
    if (this.app && this.app.ticker) {
      this.app.ticker.remove(this.boundHandlers.updateScroll);
    }
    window.removeEventListener("resize", this.boundHandlers.onResize);
  }
}

