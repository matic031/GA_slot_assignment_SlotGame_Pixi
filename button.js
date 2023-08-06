class Button {
  constructor(app, text, style, xPos, yPos, width, action) {
    let button = new PIXI.Container();
    button.interactive = true;
    button.buttonMode = true;

    let background = new PIXI.Graphics();
    background.lineStyle(2.5, 0xffffff);
    background.beginFill(0x000000);
    background.drawRoundedRect(0, 0, width + 40, style.fontSize + 50, 15);
    background.endFill();
    button.addChild(background);

    let label = new PIXI.Text(text, style);
    label.anchor.set(0.5);
    label.x = background.width / 2;
    label.y = background.height / 2;
    button.addChild(label);

    button.x = xPos;
    button.y = yPos;

    button.on("pointerover", () => { background.alpha = 0.7 });
    button.on("pointerout", () => { background.alpha = 1.0 });
    button.on("pointerdown", action);

    app.stage.addChild(button);
    return button;
  }
}

export default Button;
