import {REELS, SYMBOL_SIZE, SPACING, SYMBOLS, HEIGHT, WIDTH, startY} from "../constants.js";

// Button styles
export const buttonStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontWeight: "bold",
    fill: ["#ffffff"],
  });
  
  // Define the button positions
  export let buttonSpacing = 100;
  export let leftShift = 25;
  export let availableVerticalSpace =
    HEIGHT - 100 - startY - SYMBOLS * (SYMBOL_SIZE + SPACING);

  export let verticalShift = Math.min(
    availableVerticalSpace,
    -0.9 * availableVerticalSpace
  );
  export let buttonWidths = [
    PIXI.TextMetrics.measureText("REFRESH", buttonStyle).width,
    PIXI.TextMetrics.measureText("SPIN", buttonStyle).width,
    PIXI.TextMetrics.measureText("STOP", buttonStyle).width,
  ];
  
  export let totalButtonWidth = buttonWidths.reduce((a, b) => a + b, 0);
  export let totalSpacing = (buttonWidths.length - 1) * buttonSpacing;
  export let buttonX = (WIDTH - totalButtonWidth - totalSpacing) / 2;