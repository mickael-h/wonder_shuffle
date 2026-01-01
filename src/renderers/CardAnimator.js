import { Graphics, Container } from "pixi.js";
import { random } from "../utils/rng.js";
import { ANIMATION_CONSTANTS } from "../constants.js";

/**
 * Animation configuration
 */
const ANIMATION_CONFIG = {
  DURATION: 600, // milliseconds
  GLITTER_COUNT: 15, // number of glitter particles
  GLITTER_COLORS: [0xffd700, 0xffed4e, 0xfff8dc, 0xffa500], // golden colors
};

/**
 * Handles card animation (flip, spin, glitter effects)
 */
export class CardAnimator {
  /**
   * Creates an animated card that flips from backside to front
   * @param {Sprite} frontSprite - Front card sprite
   * @param {Sprite} backSprite - Back card sprite
   * @param {number} centerX - Center X position for animation start
   * @param {number} centerY - Center Y position for animation start
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @param {number} targetScale - Target scale (e.g., 0.25 for 25%)
   * @returns {Container} Animated card container
   */
  static createAnimatedCard(
    frontSprite,
    backSprite,
    centerX,
    centerY,
    targetX,
    targetY,
    targetScale = 1.0
  ) {
    const container = new Container();
    container.x = centerX;
    container.y = centerY;

    // Create glitter container
    const glitterContainer = new Container();
    container.addChild(glitterContainer);

    // Start with backside
    const backContainer = new Container();
    backContainer.addChild(backSprite);
    container.addChild(backContainer);

    // Front sprite (will be revealed)
    const frontContainer = new Container();
    frontContainer.addChild(frontSprite);
    frontContainer.visible = false;
    container.addChild(frontContainer);

    // Create glitter particles
    const glitters = this.createGlitterParticles();
    glitters.forEach((glitter) => {
      glitterContainer.addChild(glitter);
    });

    // Animate the card
    this.animateCard(
      container,
      backContainer,
      frontContainer,
      glitterContainer,
      centerX,
      centerY,
      targetX,
      targetY,
      targetScale
    );

    return container;
  }

  /**
   * Creates glitter particle graphics with starry, shiny appearance
   * @returns {Array<Graphics>} Array of glitter graphics
   */
  static createGlitterParticles() {
    const glitters = [];
    for (let i = 0; i < ANIMATION_CONFIG.GLITTER_COUNT; i++) {
      const glitter = new Graphics();
      const baseSize = random() * 6 + 3;
      const color =
        ANIMATION_CONFIG.GLITTER_COLORS[
          Math.floor(random() * ANIMATION_CONFIG.GLITTER_COLORS.length)
        ];

      // Draw star shape with gradient glow layers (all drawn in drawStar)
      this.drawStar(glitter, 0, 0, 4, baseSize, baseSize * 0.5, color);

      glitter.alpha = 0.9;

      // Random position around center
      const angle = (Math.PI * 2 * i) / ANIMATION_CONFIG.GLITTER_COUNT;
      const distance = random() * 100 + 50;
      glitter.x = Math.cos(angle) * distance;
      glitter.y = Math.sin(angle) * distance;

      glitters.push(glitter);
    }
    return glitters;
  }

  /**
   * Draws a star shape on a Graphics object
   * @param {Graphics} graphics - Graphics object to draw on
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} points - Number of points on the star
   * @param {number} outerRadius - Outer radius of the star
   * @param {number} innerRadius - Inner radius of the star
   * @param {number} color - Color of the star
   */
  static drawStar(graphics, x, y, points, outerRadius, innerRadius, color) {
    graphics.clear();

    // Draw outer glow circle first (background, largest)
    const outerGlowSize = outerRadius * 2.2;
    graphics.circle(x, y, outerGlowSize).fill({ color: color, alpha: 0.1 });

    // Draw medium glow circle (middle layer)
    const midGlowSize = outerRadius * 1.5;
    graphics.circle(x, y, midGlowSize).fill({ color: color, alpha: 0.2 });

    // Draw star shape
    graphics.moveTo(x, y - outerRadius);

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      graphics.lineTo(px, py);
    }

    graphics.closePath();
    graphics.fill(color);

    // Add inner highlight circle for extra shine (white center)
    graphics
      .circle(x, y, innerRadius * 0.7)
      .fill({ color: 0xffffff, alpha: 0.7 });
  }

  /**
   * Animates card flip, spin, and movement
   * @param {Container} container - Main card container
   * @param {Container} backContainer - Back card container
   * @param {Container} frontContainer - Front card container
   * @param {Container} glitterContainer - Glitter particles container
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @param {number} targetScale - Target scale (e.g., 0.25 for 25%)
   */
  static animateCard(
    container,
    backContainer,
    frontContainer,
    glitterContainer,
    startX,
    startY,
    targetX,
    targetY,
    targetScale = 1.0
  ) {
    const startTime = Date.now();
    const duration = ANIMATION_CONFIG.DURATION;

    // Mark card as currently animating to prevent hover manager interference
    container._isAnimating = true;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      // Position (move from center to target with ease-out)
      container.x = startX + (targetX - startX) * easeOut;
      container.y = startY + (targetY - startY) * easeOut;

      // Scale effect (animate from 0 to target scale smoothly)
      const scaleProgress = Math.min(progress * 1.5, 1);
      const scaleEaseOut = 1 - Math.pow(1 - scaleProgress, 3);
      const currentScale = targetScale * scaleEaseOut;
      container.scale.set(currentScale);

      // Vertical flip effect - spin twice (back -> front -> back -> front)
      // Map progress (0-1) to 2 full cycles (0-4)
      const cycleProgress = progress * 4;
      const cycleIndex = Math.floor(cycleProgress);
      const cyclePosition = cycleProgress - cycleIndex;

      // Each cycle: 0->1 = collapse, 1->2 = expand
      // Cycle 0: back collapses
      // Cycle 1: front expands, then collapses
      // Cycle 2: back expands, then collapses
      // Cycle 3: front expands (final)
      if (cycleIndex === 0) {
        // First cycle: back collapses
        backContainer.visible = true;
        frontContainer.visible = false;
        backContainer.scale.x = 1 - cyclePosition;
      } else if (cycleIndex === 1) {
        // Second cycle: front expands, then collapses
        if (cyclePosition < 0.5) {
          backContainer.visible = false;
          frontContainer.visible = true;
          frontContainer.scale.x = cyclePosition * 2;
        } else {
          frontContainer.visible = true;
          backContainer.visible = false;
          frontContainer.scale.x = 1 - (cyclePosition - 0.5) * 2;
        }
      } else if (cycleIndex === 2) {
        // Third cycle: back expands, then collapses
        if (cyclePosition < 0.5) {
          backContainer.visible = true;
          frontContainer.visible = false;
          backContainer.scale.x = cyclePosition * 2;
        } else {
          backContainer.visible = true;
          frontContainer.visible = false;
          backContainer.scale.x = 1 - (cyclePosition - 0.5) * 2;
        }
      } else {
        // Fourth cycle: front expands (final)
        backContainer.visible = false;
        frontContainer.visible = true;
        frontContainer.scale.x = cyclePosition;
      }

      // Animate glitter particles with pulsing and rotation
      glitterContainer.children.forEach((glitter, index) => {
        const sparkle = Math.sin(progress * Math.PI * 6 + index) * 0.5 + 0.5;
        // Fade out gradually with pulsing effect
        const baseAlpha = 0.9;
        const pulseAlpha = sparkle * 0.4;
        glitter.alpha = (baseAlpha + pulseAlpha) * (1 - progress * 0.7);
        glitter.rotation += 0.15;
        // Scale pulsing for twinkling effect
        const baseScale = 0.6;
        const pulseScale = sparkle * 0.5;
        glitter.scale.set(baseScale + pulseScale);
      });

      // Fade out glitter as animation progresses
      glitterContainer.alpha = 1 - progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - maintain the scale that was set (don't reset to 1)
        backContainer.scale.x = 1;
        frontContainer.scale.x = 1;
        backContainer.visible = false;
        frontContainer.visible = true;
        glitterContainer.visible = false;

        // Mark animation as complete so hover manager can safely use original positions
        container._animationComplete = true;
        container._isAnimating = false; // Animation finished, allow hover manager to interact

        // Start hover animation after flip animation completes
        this.startHoverAnimation(container);
      }
    };

    animate();
  }

  /**
   * Starts a subtle hover animation for the card (up and down motion)
   * Stores animation ID on container so it can be stopped later
   * @param {Container} container - Card container to animate
   * @param {number} baseY - Optional base Y position (uses container.y if not provided)
   */
  static startHoverAnimation(container, baseY = null) {
    // Stop any existing hover animation on this container
    this.stopHoverAnimation(container);

    const hoverIntensity = ANIMATION_CONSTANTS.HOVER_INTENSITY;
    const animationBaseY = baseY !== null ? baseY : container.y;

    // Random duration between min and max (in milliseconds)
    const duration =
      ANIMATION_CONSTANTS.HOVER_DURATION_MIN +
      random() *
        (ANIMATION_CONSTANTS.HOVER_DURATION_MAX -
          ANIMATION_CONSTANTS.HOVER_DURATION_MIN);

    // Random phase offset for variety (0 to 2π)
    const phaseOffset = random() * Math.PI * 2;

    const startTime = Date.now();
    let animationFrameId = null;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;

      // Use sine wave for smooth up/down motion with phase offset
      // Sine wave naturally provides ease in/out at the peaks and troughs
      const sineValue = Math.sin(progress * Math.PI * 2 + phaseOffset);

      // Calculate Y offset with sine wave (smooth easing at extremes)
      const yOffset = sineValue * hoverIntensity;
      container.y = animationBaseY + yOffset;

      animationFrameId = requestAnimationFrame(animate);
      // Store animation ID on container for cleanup
      container._hoverAnimationId = animationFrameId;
    };

    animationFrameId = requestAnimationFrame(animate);
    container._hoverAnimationId = animationFrameId;
    container._hoverBaseY = animationBaseY; // Store base Y for reference
  }

  /**
   * Stops the hover animation for a card container
   * @param {Container} container - Card container to stop animating
   */
  static stopHoverAnimation(container) {
    if (container._hoverAnimationId !== undefined) {
      cancelAnimationFrame(container._hoverAnimationId);
      container._hoverAnimationId = undefined;
    }
  }
}
