
import { Component, Knob, Panel } from "@repcomm/exponent-ts";

export interface SettingsOptionJSON {
  type: SettingsOptionType;
}

export type SettingsOptionType = "number-raw"|"number-knob"|"string"|"boolean"|"select";

export class SettingsOption extends Panel {
  private type: SettingsOptionType;
  private label: Component;
  private control: Component;

  constructor (type: SettingsOptionType) {
    super();
    this.label = new Component().make("span").mount(this);
    this.type = type;
    switch (type) {
      case "boolean":
        this.control = new Component()
        .make("input")
        .inputType("checkbox");
        break;
      case "number-knob":
        this.control = new Knob().setImage("./knob01.svg");
        break;
      case "number-raw":
        this.control = new Component()
        .make("input")
        .inputType("number");
        break;
      case "select":
        throw `Type ${type} is not implemented yet`;
        break;
      case "string":
        this.control = new Component()
        .make("input");
        break;
      default:
        throw `Type ${type} is not handled!`;
        break;
    }
    this.control.mount(this);
  }
  setName (name: string): this {
    this.label.textContent(name);
    return this;
  }
  getName (): string {
    //TODO - awaiting impl of getter for textContent
    return this.label.element.textContent;
  }
  getValue (): any {
    //TODO - awaiting impl of getter for value
    switch (this.type) {
      case "boolean":
        return (this.control.element as HTMLInputElement).checked;
        break;
      case "number-knob":
        return (this.control as Knob).getValue();
        break;
      case "number-raw":
        return (this.control.element as HTMLInputElement).value;
        break;
      case "string":
        return (this.control.element as HTMLInputElement).value;
        break;
      case "select":
        throw `Cannot get value, Type ${this.type} is not implemented yet.`;
        break;
      default:
        throw `Cannot get value, unhandled type ${this.type}`;
        break;
    }
  }
  setValue (v: any): this {
    switch (this.type) {
      case "boolean":
        (this.control.element as HTMLInputElement).checked = true ? false : v;
        break;
      case "number-knob":
        (this.control as Knob).setValue(parseFloat(v));
        break;
      case "number-raw":
        (this.control.element as HTMLInputElement).value = parseFloat(v).toString();
        break;
      case "string":
        (this.control.element as HTMLInputElement).value = v;
        break;
      case "select":
        throw `Cannot set value, Type ${this.type} is not implemented yet.`;
        break;
      default:
        throw `Cannot set value, unhandled type ${this.type}`;
        break;
    }
    return this;
  }
  static fromJSON (json: SettingsOptionJSON): SettingsOption {
    let result = new SettingsOption(json.type);
    throw "Not implemented yet"; //TODO
    return result;
  }
}

export class SettingsPanel extends Panel {
  private settings: Set<SettingsOption>;

  constructor () {
    super();
    this.settings = new Set();
  }
  get (id: string): SettingsOption {
    let result = null;
    for (let option of this.settings) {
      //TODO - waiting on impl of component.getId()
      if (option.element.id == id) {
        result = option;
        break;
      }
    }
    return result;
  }
  getValue (id: string): any {
    let option = this.get(id);
    if (option) {
      return option.getValue();
    }
    return null;
  }
  has (option: SettingsOption): boolean {
    return this.settings.has(option);
  }
  add (option: SettingsOption): this {
    if (this.has(option)) throw `Cannot add option ${option} more than once!`;
    this.settings.add(option);
    option.mount(this);
    return this;
  }
  create (id: string, type: SettingsOptionType = "number-raw", name?: string, defaultValue: any = null): SettingsOption {
    let result = new SettingsOption(type).setName(name).id(id);
    if (defaultValue != null) {
      result.setValue(defaultValue);
    }
    this.add(result);
    return result;
  }
}
