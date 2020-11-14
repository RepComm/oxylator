
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
const uiContext = new ContextPanel().id("context");

const renderer = new Renderer()
.removeClasses("exponent-drawing")
.styleItem("min-width", "0")
.setHandlesResize(true);

uiHSplit.setElements(uiContext, renderer);

const input = GameInput.get();

on(document.body, "wheel", (evt: WheelEvent)=>{
  renderer.addZoom( (evt.deltaY/10) * renderer.zoom);
});

setInterval(()=>{
  if (input.pointerPrimary) {
    let mx = input.raw.consumeMovementX()*1.8;
    let my = input.raw.consumeMovementY()*1.8;
    renderer.moveCenter (mx * renderer.zoom, my * renderer.zoom);
  }
}, 1000/30);

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
      console.log(node);
    })
    .textContent("Create Node")
    .styleItem("width", "100%")
    .mount(uiDesignMenu);
}

function setupModes() {
  setupDesignMode();
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
