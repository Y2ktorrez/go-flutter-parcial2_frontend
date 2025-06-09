export type ComponentType =
  | "button"
  | "textField"
  | "card"
  | "list"
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
  | "dynamicTable"
  | "label";

export type DeviceType = "samsungA10" | "realme8_5g" | "samsungS22Ultra";

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
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  description?: string;
  step?: number;
  validation?: {
    pattern?: string;
    message?: string;
  };
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
