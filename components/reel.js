import {
    SYMBOLS_COUNT,
    SYMBOL_SIZE,
    SPACING,
  } from "../constants.js";
  
  class Reel {
    constructor(app, startX, startY, symbolCount, spacing) {
      this.app = app;
      this.symbols = [];
      this.startX = startX;
      this.startY = startY;
      this.symbolCount = symbolCount;
      this.spacing = spacing;
  
      this.generateReel();
    }
  
    generateReel() {
      for (let i = 0; i < this.symbolCount; i++) {
        let number = Math.floor(Math.random() * SYMBOLS_COUNT) + 1; // Random number between 1 and SYMBOLS_COUNT
        let xPos = this.startX;
        let yPos = this.startY + i * (SYMBOL_SIZE + this.spacing);
  
        let symbol = new PIXI.Text(number, {
          fontFamily: "Arial",
          fontSize: 0.1,
          fill: 0xff1010,
          align: "center",
        });
  
        symbol.x = xPos;
        symbol.y = yPos;
  
        this.symbols.push(symbol);
        this.app.stage.addChild(symbol);
      }
    }
  }
  
  export default Reel;
  