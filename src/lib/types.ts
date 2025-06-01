export type ComponentType =
  | "button"
  | "textField"
  | "card"
  | "list"
  | "icon"
  | "container"
  | "row"
  | "column"
  | "stack"
  | "switch"
  | "checkbox"
  | "radio"
  | "chatInput"
  | "chatMessage"
  | "dropdown"
  | "inputWithLabel"
  | "switchWithLabel"
  | "radioWithLabel"
  | "checkboxWithLabel"
  | "dynamicTable";

export type DeviceType = "iphone13" | "pixel6" | "samsungs21";

export interface DesignElement {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
  children: DesignElement[];
}

export interface PropertyConfig {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "color" | "screen" | "options" | "columns" | "json";
  options?: { label: string; value: string }[];
}

export interface Screen {
  id: string;
  name: string;
  elements: DesignElement[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: number;
}

export interface TableColumn {
  id: string;
  title: string;
  width: number;
}
