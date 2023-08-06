import { reelsContainer} from '../app.js';
import {REELS, SYMBOL_SIZE, SPACING, SYMBOLS, startX, startY,} from "../constants.js";

export default function CreateReelsMask() {
// Define offsets for mask
let topOffset = 0; // offset for the top of the mask
let bottomOffset = -50; // offset for the bottom of the mask

// Create a mask for the reels container
let mask = new PIXI.Graphics();
mask.beginFill(0xffffff);
mask.drawRect(
  startX,
  startY - topOffset,
  REELS * (SYMBOL_SIZE + SPACING) + 50,
  SYMBOLS * (SYMBOL_SIZE + SPACING) + topOffset + bottomOffset
);
mask.endFill();

// Apply a mask to the reels
reelsContainer.mask = mask;
}