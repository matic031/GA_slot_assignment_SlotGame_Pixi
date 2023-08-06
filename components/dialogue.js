import app from "../app.js";
import { modifyOkDialogueButtonClicked } from "../app.js";
import {clickSound} from "../constants.js"

export function HideDialogue(spineAnimation) {
    if (spineAnimation) {
      // Play the animation
      spineAnimation.state.setAnimation(0, "out", false);
  
      setTimeout(() => {
        // Remove the Spine animation from the stage
        app.stage.removeChild(spineAnimation);
  
        // Clean up resources
        spineAnimation.state.clearListeners();
        spineAnimation.destroy();
      }, 1000);
    }
  }
  
  // Define the base text style
  const baseTextStyle = {
    fontFamily: "Arial",
    fontWeight: "bold",
    fill: ["#ffffff"],
    align: "center",
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 10,
    dropShadowDistance: 5,
    dropShadowAngle: Math.PI / 6,
  };
  
  // Define the text styles with different font sizes
  const btnTextStyle = new PIXI.TextStyle({
    ...baseTextStyle,
    fontSize: 65,
  });

  const txtTextStyle = new PIXI.TextStyle({
    ...baseTextStyle,
    fontSize: 30,
  });
  
  // Dialogue button Text
  export let btnText = new PIXI.Text("", btnTextStyle);
  
  // Dialogue OK Text
  let txtText = new PIXI.Text("OK", txtTextStyle);
  
  
  function createSpineAnimation(resources) {
    const spineAnimation = new PIXI.spine.Spine(resources.spineData.spineData);
  
    spineAnimation.skeleton.setSkinByName("normal");
    spineAnimation.skeleton.setSlotsToSetupPose();
    spineAnimation.state.setAnimation(0, "in", false);
  
    spineAnimation.position.set(app.renderer.width / 2, app.renderer.height / 2);
  
    app.stage.addChild(spineAnimation);
  
    const buttonSlotIndex = spineAnimation.skeleton.findSlotIndex("button");
    const buttonSprite = spineAnimation.slotContainers[buttonSlotIndex];
    buttonSprite.interactive = true;
  
    buttonSprite.on("pointerover", () => {
      spineAnimation.skeleton.setSkinByName("hover");
      spineAnimation.skeleton.setSlotsToSetupPose();
    });
  
    buttonSprite.on("pointerdown", () => {
      clickSound.play();
      spineAnimation.skeleton.setSkinByName("pressed");
      spineAnimation.skeleton.setSlotsToSetupPose();
      //okDialogueButtonClicked = true;
      modifyOkDialogueButtonClicked(true);
      HideDialogue(spineAnimation);
    });
  
    buttonSprite.on("pointerupoutside", () => {
      spineAnimation.skeleton.setSkinByName("normal");
      spineAnimation.skeleton.setSlotsToSetupPose();
    });
  
    buttonSprite.on("pointerout", () => {
      spineAnimation.skeleton.setSkinByName("normal");
      spineAnimation.skeleton.setSlotsToSetupPose();
    });
  
    btnText.anchor.set(0.5);
    txtText.anchor.set(0.5);
  
    const btnPlaceholderSlot = spineAnimation.skeleton.findSlot(
      "btn_txt_placeholder"
    );
    const txtPlaceholderSlot = spineAnimation.skeleton.findSlot("txt_placeholder");
  
    let btnTextContainer = spineAnimation.slotContainers[btnPlaceholderSlot.data.index];
    let txtTextContainer = spineAnimation.slotContainers[txtPlaceholderSlot.data.index];
  
    btnTextContainer.addChild(btnText);
    txtTextContainer.addChild(txtText);
  
    btnText.scale.set(-1 / btnTextContainer.scale.x, 1 / btnTextContainer.scale.y);
    txtText.scale.set(-1 / txtTextContainer.scale.x, 1 / txtTextContainer.scale.y);
  
    btnText.rotation = -btnTextContainer.rotation + Math.PI;
    txtText.rotation = -txtTextContainer.rotation + Math.PI;
  
    btnText.position.set(-btnTextContainer.position.x, -btnTextContainer.position.y + 70);
    txtText.position.set(-txtTextContainer.position.x, -txtTextContainer.position.y - 185);
  
    return spineAnimation;
  }
  
  export function ShowDialogue(delay) {
    const loader = new PIXI.Loader();
  
    loader
      .add("spineData", "./Spines/dialogue.json")
      .add("imageName", "./Spines/dialogue.webp")
      .add("atlasData", "./Spines/dialogue.atlas")
      .load((loader, resources) => {
        setTimeout(() => {
          const spineAnimation = createSpineAnimation(resources);
        }, delay);
      });
  }