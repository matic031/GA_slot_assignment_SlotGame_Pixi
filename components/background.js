import {
  WIDTH,
  HEIGHT,
} from "../constants.js";
import app from "../app.js";

export default class Background {
  constructor(backgroundImageURL) {
    this.backgroundImageURL = backgroundImageURL;
  }

  loadBackground() {
    const backgroundTexture = PIXI.Texture.from(this.backgroundImageURL);

    const backgroundSprite = new PIXI.Sprite(backgroundTexture);
    backgroundSprite.width = WIDTH;
    backgroundSprite.height = HEIGHT;

    app.stage.addChild(backgroundSprite);
    app.stage.setChildIndex(backgroundSprite, 0);

    document.body.appendChild(app.view);

    // Adjust the canvas position to screen center
    app.view.style.position = "absolute";
    app.view.style.top = "50%";
    app.view.style.left = "50%";
    app.view.style.transform = "translate(-50%, -50%)";
  }
}
