
import { Node, NodeCreateOptions } from "./node";
import { Drawing } from "@repcomm/exponent-ts";
import { roundRect } from "./math";

/**
 * 
 */
export class Renderer extends Drawing {
  private nodes: Set<Node>;
  private _x: number;
  private _y: number;
  private _zoom: number;
  private zoomMin: number;
  private zoomMax: number;
  private fontFamily: string;
  private fontSize: number;

  constructor() {
    super();
    this._x = 0;
    this._y = 0;
    this._zoom = 1;
    this.zoomMin = 0.1;
    this.zoomMax = 10;
    this.fontFamily = "courier";
    this.fontSize = 20;

    this.nodes = new Set();
    /**Add the node rendering pass
     */
    this.addRenderPass((ctx) => {
      ctx.save();
      ctx.translate(this.width / 2, this.height / 2);
      ctx.scale(1 / this.zoom, 1 / this.zoom);
      ctx.translate(
        this.x,
        this.y
      );

      let nodeWidth: number = 10;
      let nodeHeight: number = this.fontSize;
      let params: Array<string>;
      let longestParamName = "";
      let longestParamWidth = 0;
      let nameWidth = 0;

      this.nodes.forEach((node) => {
        ctx.save();
        ctx.translate(node.x, node.y);

        //CALCULATE SIZE
        nodeWidth = 0;
        nodeHeight = this.fontSize;
        longestParamWidth = 0;

        if (node.hasParams()) {
          params = node.getInputNames();
          nodeHeight = (params.length + 1) * this.fontSize;
          for (let param of params) {
            if (param.length > longestParamName.length) longestParamName = param;
          }
          ctx.font = `${this.fontSize}px ${this.fontFamily}`;
          longestParamWidth = ctx.measureText(longestParamName).width;

          nodeWidth += longestParamWidth;
        }

        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        nameWidth = ctx.measureText(node.name).width;
        nodeWidth += nameWidth;

        //FILL BACKGROUND OF NODE
        ctx.fillStyle = node.color;
        roundRect(ctx, 0, 0, nodeWidth, nodeHeight, 5);
        ctx.fill();

        if (node.hasParams()) {
          ctx.fillStyle = node.textcolor;
          let ih = 0;
          for (let i = 0; i < params.length; i++) {
            ih = this.fontSize * (i + 1 + 0.75)
            ctx.fillText(params[i], 0, ih);
            ctx.fillRect(-10, ih-(this.fontSize/2), 10, 10);
          }
        }

        //FILL NAME
        ctx.fillStyle = node.textcolor;
        ctx.fillText(node.name, (nodeWidth / 2) - nameWidth/2, this.fontSize);

        ctx.restore();
      });
      ctx.restore();
    });
  }
  get x(): number {
    return this._x;
  }
  get y(): number {
    return this._y;
  }
  set x(v: number) {
    this._x = v;
    this.setNeedsRedraw(true);
  }
  set y(v: number) {
    this._y = v;
    this.setNeedsRedraw(true);
  }
  set zoom(z: number) {
    if (z < this.zoomMin) z = this.zoomMin;
    if (z > this.zoomMax) z = this.zoomMax;
    this._zoom = z;
    this.setNeedsRedraw(true);
  }
  get zoom(): number {
    return this._zoom;
  }
  addZoom(za: number): this {
    this.zoom = this.zoom + za;
    return this;
  }
  moveCenter(movementX: number, movementY: number): this {
    this._x += movementX;
    this._y += movementY;
    this.setNeedsRedraw(true);
    return this;
  }
  addNode(node: Node): this {
    if (this.hasNode(node)) throw `Node ${node} already added, cannot add more than once`;
    this.nodes.add(node);
    this.setNeedsRedraw(true);
    return this;
  }
  hasNode(node: Node): boolean {
    return this.nodes.has(node);
  }
  removeNode(node: Node): this {
    if (!this.hasNode(node)) throw `Node ${node} is not contained in set, cannot remove`;
    this.nodes.delete(node);
    this.setNeedsRedraw(true);
    return this;
  }
  createNode(options?: NodeCreateOptions): Node {
    let result: Node = new Node(options);
    result.x = -this.x;
    result.y = -this.y;
    this.addNode(result);
    return result;
  }
}
