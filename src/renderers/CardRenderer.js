import { Sprite, Container, Assets, SCALE_MODES } from "pixi.js";
import { CARD_CONFIG } from "../constants.js";

/**
 * Handles rendering of individual tarot card images
 */
export class CardRenderer {
  constructor() {
    this.cardWidth = CARD_CONFIG.WIDTH;
    this.cardHeight = CARD_CONFIG.HEIGHT;
    this.textureCache = new Map();
    this.backsideTexture = null;
  }

  /**
   * Loads the backside texture
   * @returns {Promise<Texture|null>} Backside texture
   */
  async loadBacksideTexture() {
    if (this.backsideTexture) {
      return this.backsideTexture;
    }

    try {
      const texture = await Assets.load("/assets/images/backside.png");
      
      // Enable linear filtering for smooth scaling (better anti-aliasing)
      texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
      
      this.backsideTexture = texture;
      return texture;
    } catch (error) {
      console.error("Failed to load backside texture:", error);
      return null;
    }
  }

  /**
   * Creates a card sprite (either front or back)
   * @param {string|Texture} cardNameOrTexture - Card name or texture
   * @param {boolean} isBackside - Whether to create backside sprite
   * @returns {Promise<Sprite|null>} Card sprite
   */
  async createCardSprite(cardNameOrTexture, isBackside = false) {
    try {
      let texture;
      if (isBackside) {
        texture = await this.loadBacksideTexture();
      } else if (typeof cardNameOrTexture === "string") {
        texture = await this.loadCardTexture(cardNameOrTexture);
      } else {
        texture = cardNameOrTexture;
      }

      if (!texture) {
        return null;
      }

      const sprite = new Sprite(texture);

      // Center anchor point for rotation (set before scaling)
      sprite.anchor.set(0.5, 0.5);

      // Scale sprite to fit card dimensions while maintaining aspect ratio
      const scale = Math.min(
        this.cardWidth / sprite.width,
        this.cardHeight / sprite.height
      );
      sprite.scale.set(scale);

      return sprite;
    } catch (error) {
      console.error("Error creating card sprite:", error);
      return null;
    }
  }

  /**
   * Creates a complete card graphic container from an image
   * @param {string} cardName - Name of the tarot card
   * @returns {Promise<Container|null>} Card container or null if invalid
   */
  async createCardGraphic(cardName) {
    if (!this.isValidCardName(cardName)) {
      console.error("Invalid card name provided to createCardGraphic", cardName);
      return null;
    }

    try {
      const texture = await this.loadCardTexture(cardName);
      if (!texture) {
        return null;
      }

      const container = new Container();
      const sprite = new Sprite(texture);

      // Scale sprite to fit card dimensions while maintaining aspect ratio
      const scale = Math.min(
        this.cardWidth / sprite.width,
        this.cardHeight / sprite.height
      );
      sprite.scale.set(scale);

      container.addChild(sprite);
      return container;
    } catch (error) {
      console.error("Error creating card graphic:", error);
      return null;
    }
  }

  /**
   * Validates card name
   * @param {string} cardName - Card name to validate
   * @returns {boolean} True if card name is valid
   */
  isValidCardName(cardName) {
    return cardName && typeof cardName === "string" && cardName.length > 0;
  }

  /**
   * Loads card texture from image file, using cache if available
   * @param {string} cardName - Name of the tarot card
   * @returns {Promise<Texture>} Loaded texture
   */
  async loadCardTexture(cardName) {
    // Check cache first
    if (this.textureCache.has(cardName)) {
      return this.textureCache.get(cardName);
    }

    try {
      const imagePath = `/assets/images/${cardName}.png`;
      const texture = await Assets.load(imagePath);

      // Enable linear filtering for smooth scaling (better anti-aliasing)
      texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

      // Cache the texture for future use
      this.textureCache.set(cardName, texture);

      return texture;
    } catch (error) {
      console.error(`Failed to load texture for card: ${cardName}`, error);
      return null;
    }
  }

  /**
   * Preloads all card textures including backside
   * @returns {Promise<void>}
   */
  async preloadAllTextures(cardNames) {
    const loadPromises = [
      this.loadBacksideTexture(),
      ...cardNames.map((cardName) => this.loadCardTexture(cardName)),
    ];
    await Promise.all(loadPromises);
  }
}
