
import { Component, Panel, Knob } from "@repcomm/exponent-ts";

export type WebAudioNodeType = "keyboard" | "analyser" | "biquadfilter" | "constant" | "convolver" | "delay" | "dynamicscompressor" | "gain" | "iirfilter" | "mediaelementsource" | "mediastreamdestination" | "mediastreamsource" | "mediastreamtracksource" | "oscillator" | "panner" | "periodicwave" | "scriptprocessor" | "stereopanner" | "waveshaper" | "destination";
export const WebAudioNodeTypeStrings = ["keyboard", "analyser", "biquadfilter", "constant", "convolver", "delay", "dynamicscompressor", "gain", "iirfilter", "mediaelementsource", "mediastreamdestination", "mediastreamsource", "mediastreamtracksource", "oscillator", "panner", "periodicwave", "scriptprocessor", "stereopanner", "waveshaper", "destination"];

export interface CreateAudioNodeOptions {
  /**For "mediaelementsource"*/
  mediaSource?: HTMLMediaElement;
  /**For "mediastreamsource"*/
  mediaStream?: MediaStream;
  /**For "mediastreamtracksource"*/
  mediaStreamTrack?: MediaStreamTrack;
  /**For "iirfilter"*/
  feedForward?: number[] | Iterable<number>;
  /**For "iirfilter"*/
  feedBack?: number[] | Iterable<number>;
}

/**Why isn't this implemented in Web Audio API?*/
export const createAudioNode = (ctx: AudioContext, type: WebAudioNodeType, options?: CreateAudioNodeOptions): AudioNode => {
  switch (type) {
    case "analyser":
      return ctx.createAnalyser();
    case "biquadfilter":
      return ctx.createBiquadFilter();
    case "constant":
      return ctx.createConstantSource();
    case "convolver":
      return ctx.createConvolver();
    case "delay":
      return ctx.createDelay();
    case "dynamicscompressor":
      return ctx.createDynamicsCompressor();
    case "gain":
      return ctx.createGain();
    case "iirfilter":
      return ctx.createIIRFilter(options.feedForward, options.feedBack);
    case "mediaelementsource":
      return ctx.createMediaElementSource(options.mediaSource);
    case "mediastreamdestination":
      return ctx.createMediaStreamDestination();
    case "mediastreamsource":
      return ctx.createMediaStreamSource(options.mediaStream);
    case "mediastreamtracksource":
      return ctx.createMediaStreamTrackSource(options.mediaStreamTrack);
    case "oscillator":
      let osc = ctx.createOscillator();
      osc.start();
      return osc;
    case "panner":
      return ctx.createPanner();
    case "scriptprocessor":
      return ctx.createScriptProcessor();
    case "stereopanner":
      return ctx.createStereoPanner();
    case "waveshaper":
      return ctx.createWaveShaper();
    case "destination":
      return ctx.destination;
    case "keyboard":
      //NODE IS NOT INTERNAL TO WEB AUDIO API
      break;
    default:
      throw `Node type ${type} is not handled!`
  }
}

export interface AudioParams {
  [key: string]: AudioParam;
}
/**Why isn't this implemented in Web Audio API?*/
export const getAudioNodeParams = (node: AudioNode): AudioParams => {
  let result: AudioParams = {};
  if (node instanceof BiquadFilterNode) {
    result["q"] = node.Q;
    result["detune"] = node.detune;
    result["frequency"] = node.frequency;
    result["gain"] = node.gain;
  } else if (node instanceof ConstantSourceNode) {
    result["offset"] = node.offset;
  } else if (node instanceof DelayNode) {
    result["delaytime"] = node.delayTime;
  } else if (node instanceof DynamicsCompressorNode) {
    result["attack"] = node.attack;
    result["knee"] = node.knee;
    result["ratio"] = node.ratio;
    result["release"] = node.release;
    result["threshold"] = node.threshold;
  } else if (node instanceof GainNode) {
    result["gain"] = node.gain;
  } else if (node instanceof OscillatorNode) {
    result["detune"] = node.detune;
    result["frequency"] = node.frequency;
  } else if (node instanceof PannerNode) {
    result["orientationx"] = node.orientationX;
    result["orientationy"] = node.orientationY;
    result["orientationz"] = node.orientationZ;
    result["positionx"] = node.positionX;
    result["positiony"] = node.positionY;
    result["positionz"] = node.positionZ;
  } else if (node instanceof StereoPannerNode) {
    result["pan"] = node.pan;
  }
  return result;
}

export interface NodeJSON {
  x: number;
  y: number;
  type: WebAudioNodeType;
  name: string;
  color: string;
  textcolor: string;
}

export interface NodeCreateOptions {
  x?: number;
  y?: number;
  /**Must pass audioContext if passing internalType*/
  internalType?: WebAudioNodeType;
  audioContext?: AudioContext;
  color?: string;
  textcolor?: string;
  name?: string;
}

export type NodeControlType = "knob" | "slider" | "field";

/**A re-target-able, control input for Node audio params and fields
 * 
 * Can change type dynamically with setType
 */
export class NodeControl extends Panel {
  private target: AudioParam | any;
  private targetPropName: string;

  private control: Component;
  private label: Component;
  private type: NodeControlType;

  constructor() {
    super();
    this.label = new Component().make("span");
    // this.setType("knob");
    this.textContent("Node Control");
    this.mount(this.label);
  }
  /**Set the label text of this NodeControl*/
  textContent(str: string): this {
    this.label.textContent(str);
    return this;
  }
  private onChangeType(oldType: NodeControlType, currentType: NodeControlType) {

  }
  setType(type: NodeControlType): this {
    if (this.type == type) {
      //throw `Cannot change type from ${this.type} to ${type} as they are the same`;
    }
    this.onChangeType(this.type, type);
    this.type = type;

    this.clearUI();
    if (this.type === "knob") {
      this.control = new Knob()
      .setImage("knob01.svg")
      .on("mouseup", (evt) => {
        let v: number = (this.control as Knob).getValue();
        console.log("Control value is now", v);

        if (this.hasTarget()) {
          this.setValue(v);
        } else {
          console.log("Has target ->", this.hasTarget());
        }
      });
    }

    this.control.mount(this);
    return this;
  }
  hasTarget(): boolean {
    return this.target != null && this.target != undefined;
  }
  private onChangeTarget(oldTarget: any, oldProp: string, currentTarget: any, currentProp: string) {
    //TODO
  }
  setPropertyInfluence(target: any, propName: string): this {
    this.onChangeTarget(this.target, this.targetPropName, target, propName);
    this.target = target;
    this.targetPropName = propName;
    //Copy value from the internal property
    this.setValue(this.getIntervalValue());
    return this;
  }
  setAudioParamInfluence(target: AudioParam): this {
    this.setPropertyInfluence(target, "value");
    return this;
  }
  /**Get the value represented by the control*/
  getValue(): number {
    //TODO
    return 0;
  }
  /**The the value of the control*/
  setValue(v: number, setInteral: boolean = true): this {
    //TODO

    if (setInteral) this.setInteralValue(v);
    return this;
  }
  /**Get the value of the property that the control is responsible for changing*/
  getIntervalValue(): number {
    return this.target[this.targetPropName];
  }
  /**Sets the value of the property that the control is responsible for changing*/
  setInteralValue(v: number): this {
    this.target[this.targetPropName] = v;
    return this;
  }
  /**Has UI element or not*/
  hasControl(): boolean {
    return this.control != null && this.control != undefined;
  }
  /**Cleans up UI part of the control*/
  clearUI(): this {
    //TODO
    if (this.hasControl()) {
      this.control.unmount();
      this.control.removeAllListeners();
    }
    return this;
  }
  clearInfluence(): this {
    this.target = null;
    this.targetPropName = null;
    this.clearUI();
    return this;
  }
}

export class Node extends Panel {
  private controls: Map<string, NodeControl>;
  private _x: number;
  private _y: number;
  /**Internal web AudioNode type*/
  private internalType: WebAudioNodeType;
  /**Internal web AudioNode*/
  private internal: AudioNode;
  /**Text as displayed to user, not unique*/
  private _name: string;
  private _color: string;
  private _textcolor: string;
  private internalParams: AudioParams;

  constructor(options?: NodeCreateOptions) {
    super();
    this.styleItem("display", "flex");
    this.styleItem("flex-direction", "column");
    this.controls = new Map();
    this.x = options?.x || 0;
    this.y = options?.y || 0;
    if (options?.internalType) {
      if (!options.audioContext) throw `Must pass audioContext in NodeCreateOptions if passing internalType! type was ${options.internalType}, ctx was ${options.audioContext}`;
      this.setType(options.internalType, options.audioContext);
    }
    this.color = options?.color || "#222255";
    this.textcolor = options?.textcolor || "#9f9f9f";
    this.name = options?.name || options?.internalType || "Node";
  }

  get x(): number {
    return this._x;
  }
  get y(): number {
    return this._y;
  }
  set x(v: number) {
    this._x = v;
  }
  set y(v: number) {
    this._y = v;
  }
  set color(c: string) {
    this._color = c;
  }
  get color(): string {
    return this._color;
  }
  set name(s: string) {
    this._name = s;
  }
  get name(): string {
    return this._name;
  }
  set textcolor(c: string) {
    this._textcolor = c;
  }
  get textcolor(): string {
    return this._textcolor;
  }
  disconnectAll() {
    //TODO
  }
  getInternal(): AudioNode {
    return this.internal;
  }
  setInternal(node: AudioNode): this {
    this.internal = node;
    this.internalParams = getAudioNodeParams(this.internal);

    //TODO - recycle
    // this.clearControls();

    //Populate UI controls for audio params
    let paramNames = this.getParams();
    let param: AudioParam;

    for (let paramName of paramNames) {
      param = this.getParam(paramName);
      this.createControl(paramName)
        .setType("knob")
        .textContent(paramName)
        .setAudioParamInfluence(param);
    }

    return this;
  }
  getParam(id: string): AudioParam {
    return this.internalParams[id];
  }
  hasParams(): boolean {
    return this.internalParams != null && this.internalParams != undefined;
  }
  getParams(): Array<string> {
    return Object.keys(this.internalParams);
  }
  getInputNames (): Array<string> {
    let result = this.getParams();
    result.push("audio");
    return result;
  }
  /**Set the type of node
   * Warning: Regenerates internal nodes
   */
  setType(type: WebAudioNodeType, ctx: AudioContext, options?: CreateAudioNodeOptions): this {
    this.internalType = type;
    this.disconnectAll();
    this.setInternal(createAudioNode(ctx, type, options));
    return this;
  }
  /**Get the type of node*/
  getType(): WebAudioNodeType {
    return this.internalType;
  }
  /**Checks if a control is contained by id for this node*/
  hasControl(id: string): boolean {
    return this.controls.has(id);
  }
  /**Gets a control
   */
  getControl(id: string): NodeControl {
    if (!this.hasControl(id)) throw `No control with id ${id} found!`;
    return this.controls.get(id);
  }
  /**Sets a control 
   */
  private setControl(id: string, ctrl: NodeControl): this {
    this.controls.set(id, ctrl);
    ctrl.mount(this);
    return this;
  }
  private clearControls(): this {
    this.controls.forEach((ctrl) => {
      ctrl.clearInfluence();
    });
    this.controls.clear();
    return this;
  }
  private createControl(id: string): NodeControl {
    let ctrl = new NodeControl();
    this.setControl(id, ctrl);
    return ctrl;
  }
  /**Get all the control ids*/
  getControls(): string[] {
    let result: Array<string> = new Array(this.controls.size);
    let ind: number = 0;
    this.controls.forEach((v, k) => {
      result[ind] = k;
      ind++;
    });
    return result;
  }
  toJSON(): NodeJSON {
    return {
      x: this.x,
      y: this.y,
      name: this.name,
      type: this.getType(),
      color: this.color,
      textcolor: this.textcolor
    };
  }
  connect(dest: Node): this {
    this.getInternal().connect(dest.getInternal());
    return this;
  }
  static fromJSON(json: NodeJSON, ctx: AudioContext, options?: CreateAudioNodeOptions): Node {
    let result = new Node();
    result.x = json.x;
    result.y = json.y;
    result.name = json.name;
    result.setType(json.type, ctx, options);
    return result;
  }
}
