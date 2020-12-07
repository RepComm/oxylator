
import {
  ContextPanel,
  Component,
  get,
  runOnce,
  DualPanel,
  Panel,
  Button,
  on
} from "@repcomm/exponent-ts";

import { GameInput } from "@repcomm/gameinput-ts";
import { Renderer } from "./renderer";

import { WebAudioNodeTypeStrings } from "./node";
import { SettingsPanel } from "./settingspanel";
import { pointInDOMRect } from "./math";

import { Node } from "./node";

runOnce();

const componentRoot = new Component()
  .useNative(get("container"));

const uiRoot = new DualPanel()
  .id("ui")
  .mount(componentRoot)
  .setDirection("column")
  .setRatio(1, 15);

const uiRootMenu = new Panel()
  .id("menu")
  .styleItem("background-color", "#0b0b0b");

const uiRootMenuTitle = new Component()
  .make("span")
  .textContent("Oxylator")
  .styleItem("font-size", "large")
  .styleItem("padding", "2em")
  .mount(uiRootMenu);

/**Contains renderer and context panel*/
const uiHSplit = new DualPanel()
  .styleItem("display", "flex")
  .setDirection("row")
  .setRatio(1, 4);

uiRoot.setElements(uiRootMenu, uiHSplit);

/**Contains config panels */
const uiContext = new ContextPanel()
.id("context");

const renderer = new Renderer()
  .removeClasses("exponent-drawing")
  .styleItem("min-width", "0")
  .styleItem("cursor", "grab")
  .setHandlesResize(true);

uiHSplit.setElements(uiContext, renderer);

const input = GameInput.get();

input.createBinding("zoom-out").addKey("=");
input.createBinding("zoom-in").addKey("-");
input.createBinding("up").addKey("w");
input.createBinding("left").addKey("a");
input.createBinding("down").addKey("s");
input.createBinding("right").addKey("d");

function onInputZoom(amount: number) {
  renderer.addZoom((amount / 10) * renderer.zoom);
}

let MOUSE_WHEEL_DELTA_Y: number = 0;
on(document.body, "wheel", (evt: WheelEvent) => {
  MOUSE_WHEEL_DELTA_Y = evt.deltaY;
});

let selectedNode: Node = null;

function doRendererInput () {
  let moveSpeed = settings.getValue("input-move-speed");
  if (settings.getValue("input-move-scale")) moveSpeed *= renderer.zoom;

  if (input.pointerPrimary) {
    let mx = input.raw.consumeMovementX() * 1.8;
    let my = input.raw.consumeMovementY() * 1.8;

    if (!selectedNode) {
      selectedNode = renderer.selectNodeAtScreenPoint(input.raw.pointer.x, input.raw.pointer.y);
    }
    if (selectedNode) {
      selectedNode.x += mx;
      selectedNode.y += my;
      renderer.setNeedsRedraw();
    } else {
      renderer.moveCenter(mx * renderer.zoom, my * renderer.zoom);
    }
  } else {
    selectedNode = null;
  }
  if (MOUSE_WHEEL_DELTA_Y != 0) {
    onInputZoom(MOUSE_WHEEL_DELTA_Y);
    MOUSE_WHEEL_DELTA_Y = 0;
  }
  if (input.getButton("zoom-in")) {
    onInputZoom(1);
  } else if (input.getButton("zoom-out")) {
    onInputZoom(-1);
  }

  if (input.getButton("up")) {
      renderer.moveCenter(0, moveSpeed);
  } else if (input.getButton("down")) {
    renderer.moveCenter(0, -moveSpeed);
  }
  if (input.getButton("left")) {
    renderer.moveCenter(moveSpeed, 0);
  } else if (input.getButton("right")) {
    renderer.moveCenter(-moveSpeed, 0);
  }
}

setInterval(() => {
  if (pointInDOMRect(input.raw.pointer.x, input.raw.pointer.y, renderer.rect)) {
    doRendererInput();
  }
}, 1000 / 30);

const audioCtx: AudioContext = new AudioContext({
  //TODO
});
window["audioCtx"] = audioCtx;

function setupDesignMode() {
  const uiDesignMenu = new Panel()
    .styleItem("background-color", "#0f0f0f");

  uiContext.addContext("design", uiDesignMenu);

  const uiDesignButton = new Button()
    .on("click", () => {
      uiContext.switchContext("design");
    })
    .textContent("design")
    .styleItem("height", "100%")
    .mount(uiRootMenu);

  const uiCreateNodeButton = new Button()
    .on("click", () => {
      let node = renderer.createNode();
      node.mount(uiDesignMenu);
      console.log(node);
    })
    .textContent("Create Node")
    .styleItem("width", "100%")
    .mount(uiDesignMenu);
}

const settings = new SettingsPanel()
.styleItem("display", "flex")
.styleItem("flex-direction", "column");

function setupSettingsMode() {
  settings.styleItem("background-color", "#0f0f0f");

  uiContext.addContext("settings", settings);
  const uiSettingsButton = new Button()
    .on("click", () => {
      uiContext.switchContext("settings");
    })
    .textContent("settings")
    .styleItem("height", "100%")
    .mount(uiRootMenu);

  settings.create("input-move-speed", "number-raw", "Movement Speed", 3);
  settings.create("input-move-scale", "boolean", "Movement Relative To Zoom", true);
}

function setupModes() {
  setupDesignMode();
  setupSettingsMode();
}

setupModes();

let osc = renderer.createNode().setType("biquadfilter", audioCtx);
osc.x = 200;
osc.y = 20;
osc.name = "Biquad";
console.log(osc);

let dest = renderer.createNode().setType("destination", audioCtx);
dest.name = "Destination";
dest.x = -20;
dest.y = -20;
