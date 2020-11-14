
import { Component } from "@repcomm/exponent-ts";

export type WebAudioNodeType = "keyboard" | "analyser" | "biquadfilter" | "constant" | "convolver" | "delay" | "dynamicscompressor" | "gain" | "iirfilter" | "mediaelementsource" | "mediastreamdestination" | "mediastreamsource" | "mediastreamtracksource" | "oscillator" | "panner" | "periodicwave" | "scriptprocessor" | "stereopanner" | "waveshaper" | "destination";
export const WebAudioNodeTypeStrings = ["keyboard" , "analyser" , "biquadfilter" , "constant" , "convolver" , "delay" , "dynamicscompressor" , "gain" , "iirfilter" , "mediaelementsource" , "mediastreamdestination" , "mediastreamsource" , "mediastreamtracksource" , "oscillator" , "panner" , "periodicwave" , "scriptprocessor" , "stereopanner" , "waveshaper" , "destination"];

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

export class Node {
  private controls: Map<string, Component>;
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
  set x (v: number) {
    this._x = v;
  }
  set y (v: number) {
    this._y = v;
  }
  set color (c: string) {
    this._color = c;
  }
  get color (): string {
    return this._color;
  }
  set name (s: string) {
    this._name = s;
  }
  get name (): string {
    return this._name;
  }
  set textcolor (c: string) {
    this._textcolor = c;
  }
  get textcolor (): string {
    return this._textcolor;
  }
  disconnectAll () {
    //TODO
  }
  getInternal (): AudioNode {
    return this.internal;
  }
  setInternal (node: AudioNode): this {
    this.internal = node;
    this.internalParams = getAudioNodeParams(this.internal);
    return this;
  }
  getParam (id: string): AudioParam {
    return this.internalParams[id];
  }
  hasParams (): boolean {
    return this.internalParams != null && this.internalParams != undefined;
  }
  getParams (): Array<string> {
    let result = Object.keys(this.internalParams);
    result.push("audio in");
    return result;
  }
  /**Set the type of node
   * Warning: Regenerates internal nodes
   */
  setType(type: WebAudioNodeType, ctx: AudioContext, options?: CreateAudioNodeOptions): this {
    this.internalType = type;
    try {
      this.disconnectAll();
      this.setInternal(createAudioNode(ctx, type, options));
      this.getInternal()
    } catch (ex) {
      throw ex;
    }
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
  getControl(id: string): Component {
    if (!this.hasControl(id)) throw `No control with id ${id} found!`;
    return this.controls.get(id);
  }
  /**Sets a control 
   */
  setControl(id: string, ctrl: Component): this {
    this.controls.set(id, ctrl);
    return this;
  }
  /**Get all the control ids
   */
  getControls(): string[] {
    let result: Array<string> = new Array(this.controls.size);
    let ind: number = 0;
    this.controls.forEach((v, k) => {
      result[ind] = k;
      ind++;
    });
    return result;
  }
  toJSON (): NodeJSON {
    return {
      x: this.x,
      y: this.y,
      name: this.name,
      type: this.getType(),
      color: this.color,
      textcolor: this.textcolor
    };
  }
  connect (dest: Node): this {
    this.getInternal().connect(dest.getInternal());
    return this;
  }
  static fromJSON (json: NodeJSON, ctx: AudioContext, options?: CreateAudioNodeOptions): Node {
    let result = new Node();
    result.x = json.x;
    result.y = json.y;
    result.name = json.name;
    result.setType(json.type, ctx, options);
    return result;
  }
}
