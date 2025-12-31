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

    await app.init({
      width: CANVAS_CONFIG.WIDTH,
      height: CANVAS_CONFIG.HEIGHT,
      backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR,
      antialias: true,
    });

    const container = document.getElementById("canvas-container");
    if (!container) {
      throw new Error("Canvas container element not found");
    }

    if (!app.canvas) {
      throw new Error("Failed to create PixiJS canvas");
    }

    container.appendChild(app.canvas);

    return app;
  }
}

