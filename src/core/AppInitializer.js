import { Application } from "pixi.js";
import { CANVAS_CONFIG } from "../constants.js";

/**
 * Handles PixiJS application initialization
 */
export class AppInitializer {
  /**
   * Initializes and returns a PixiJS Application instance
   * @returns {Promise<Application>} Initialized PixiJS application
   */
  static async initialize() {
    const app = new Application();

    // Get container to determine size
    const container = document.getElementById("canvas-container");
    if (!container) {
      throw new Error("Canvas container element not found");
    }

    // Get container dimensions
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width || CANVAS_CONFIG.WIDTH;
    const height = containerRect.height || CANVAS_CONFIG.HEIGHT;

    await app.init({
      width: width,
      height: height,
      backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR,
      antialias: true,
      resolution: Math.max(window.devicePixelRatio || 1, 2), // Use at least 2x resolution for better quality
      autoDensity: true, // Automatically adjust CSS size to match resolution
      powerPreference: "high-performance", // Use dedicated GPU if available
    });

    if (!app.canvas) {
      throw new Error("Failed to create PixiJS canvas");
    }

    container.appendChild(app.canvas);

    // Handle window resize to update canvas
    window.addEventListener("resize", () => {
      const newRect = container.getBoundingClientRect();
      if (newRect.width > 0 && newRect.height > 0) {
        app.renderer.resize(newRect.width, newRect.height);
      }
    });

    return app;
  }
}

