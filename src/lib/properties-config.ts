import type { ComponentType, PropertyConfig } from "./types";

export function getPropertiesConfig(type: ComponentType): PropertyConfig[] {
  switch (type) {
    case "button":
      return [
        { name: "text", label: "Text", type: "text" },
        {
          name: "variant",
          label: "Variant",
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
        },
        { name: "rounded", label: "Rounded", type: "boolean" },
        { name: "color", label: "Color", type: "color" },
        { name: "textColor", label: "Text Color", type: "color" },
        { name: "padding", label: "Padding", type: "number" },
        { name: "navigateTo", label: "Navigate To Screen", type: "screen" },
      ];
    case "textField":
      return [
        { name: "hint", label: "Hint Text", type: "text" },
        { name: "label", label: "Label", type: "text" },
        { name: "hasIcon", label: "Has Icon", type: "boolean" },
        { name: "icon", label: "Icon", type: "text" },
        { name: "validation", label: "Enable Validation", type: "boolean" },
        { name: "validationMessage", label: "Validation Message", type: "text" },
      ];
    case "card":
      return [
        { name: "title", label: "Title", type: "text" },
        { name: "subtitle", label: "Subtitle", type: "text" },
        { name: "content", label: "Content", type: "text" },
        { name: "showImage", label: "Show Image", type: "boolean" },
        { name: "imageHeight", label: "Image Height", type: "number" },
        { name: "elevation", label: "Elevation", type: "number" },
        { name: "borderRadius", label: "Border Radius", type: "number" },
        { name: "color", label: "Background Color", type: "color" },
        { name: "padding", label: "Padding", type: "number" },
      ];
    case "list":
      return [
        {
          name: "direction",
          label: "Direction",
          type: "select",
          options: [
            { label: "Vertical", value: "vertical" },
            { label: "Horizontal", value: "horizontal" },
          ],
        },
        { name: "scrollable", label: "Scrollable", type: "boolean" },
        { name: "itemHeight", label: "Item Height", type: "number" },
        { name: "data", label: "List Data", type: "json" },
      ];
    case "icon":
      return [
        { name: "name", label: "Icon Name", type: "text" },
        { name: "color", label: "Color", type: "color" },
        { name: "size", label: "Size", type: "number" },
      ];
    case "container":
      return [
        { name: "color", label: "Color", type: "color" },
        { name: "padding", label: "Padding", type: "number" },
        { name: "margin", label: "Margin", type: "number" },
        { name: "borderRadius", label: "Border Radius", type: "number" },
      ];
    case "row":
      return [
        {
          name: "mainAxisAlignment",
          label: "Main Axis Alignment",
          type: "select",
          options: [
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Space Between", value: "spaceBetween" },
            { label: "Space Around", value: "spaceAround" },
            { label: "Space Evenly", value: "spaceEvenly" },
          ],
        },
        {
          name: "crossAxisAlignment",
          label: "Cross Axis Alignment",
          type: "select",
          options: [
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
        { name: "padding", label: "Padding", type: "number" },
      ];
    case "column":
      return [
        {
          name: "mainAxisAlignment",
          label: "Main Axis Alignment",
          type: "select",
          options: [
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Space Between", value: "spaceBetween" },
            { label: "Space Around", value: "spaceAround" },
            { label: "Space Evenly", value: "spaceEvenly" },
          ],
        },
        {
          name: "crossAxisAlignment",
          label: "Cross Axis Alignment",
          type: "select",
          options: [
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
        { name: "padding", label: "Padding", type: "number" },
      ];
    case "stack":
      return [
        {
          name: "alignment",
          label: "Alignment",
          type: "select",
          options: [
            { label: "Top Left", value: "topLeft" },
            { label: "Top Center", value: "topCenter" },
            { label: "Top Right", value: "topRight" },
            { label: "Center Left", value: "centerLeft" },
            { label: "Center", value: "center" },
            { label: "Center Right", value: "centerRight" },
            { label: "Bottom Left", value: "bottomLeft" },
            { label: "Bottom Center", value: "bottomCenter" },
            { label: "Bottom Right", value: "bottomRight" },
          ],
        },
        { name: "padding", label: "Padding", type: "number" },
      ];
    case "switch":
      return [
        { name: "label", label: "Label", type: "text" },
        { name: "value", label: "Initial Value", type: "boolean" },
        { name: "activeColor", label: "Active Color", type: "color" },
        { name: "inactiveColor", label: "Inactive Color", type: "color" },
        { name: "interactive", label: "Interactive", type: "boolean" },
      ];
    case "checkbox":
      return [
        { name: "label", label: "Label", type: "text" },
        { name: "value", label: "Initial Value", type: "boolean" },
        { name: "activeColor", label: "Active Color", type: "color" },
        { name: "interactive", label: "Interactive", type: "boolean" },
      ];
    case "radio":
      return [
        { name: "value", label: "Value", type: "boolean" },
        { name: "activeColor", label: "Active Color", type: "color" },
        { name: "groupValue", label: "Group Value", type: "text" },
      ];
    case "chatInput":
      return [
        { name: "placeholder", label: "Placeholder", type: "text" },
        { name: "buttonText", label: "Button Text", type: "text" },
        { name: "buttonColor", label: "Button Color", type: "color" },
      ];
    case "chatMessage":
      return [
        { name: "text", label: "Message Text", type: "text" },
        { name: "isUser", label: "Is User Message", type: "boolean" },
        { name: "avatar", label: "Show Avatar", type: "boolean" },
        { name: "timestamp", label: "Show Timestamp", type: "boolean" },
      ];
    case "dropdown":
      return [
        { name: "label", label: "Label", type: "text" },
        { name: "placeholder", label: "Placeholder", type: "text" },
        { name: "options", label: "Options", type: "options" },
        { name: "value", label: "Initial Value", type: "text" },
        { name: "required", label: "Required", type: "boolean" },
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "borderColor", label: "Border Color", type: "color" },
        { name: "backgroundColor", label: "Background Color", type: "color" },
        { name: "interactive", label: "Interactive", type: "boolean" },
      ];
    case "inputWithLabel":
      return [
        { name: "label", label: "Label Text", type: "text" },
        { name: "placeholder", label: "Placeholder", type: "text" },
        { name: "value", label: "Value", type: "text" },
        {
          name: "type",
          label: "Input Type",
          type: "select",
          options: [
            { label: "Text", value: "text" },
            { label: "Email", value: "email" },
            { label: "Password", value: "password" },
            { label: "Number", value: "number" },
            { label: "Tel", value: "tel" },
          ],
        },
        { name: "required", label: "Required", type: "boolean" },
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "borderColor", label: "Border Color", type: "color" },
        { name: "labelColor", label: "Label Color", type: "color" },
      ];
    case "switchWithLabel":
      return [
        { name: "label", label: "Label Text", type: "text" },
        { name: "value", label: "Value", type: "boolean" },
        { name: "activeColor", label: "Active Color", type: "color" },
        { name: "inactiveColor", label: "Inactive Color", type: "color" },
        {
          name: "labelPosition",
          label: "Label Position",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "labelColor", label: "Label Color", type: "color" },
      ];
    case "radioWithLabel":
      return [
        { name: "label", label: "Label Text", type: "text" },
        { name: "value", label: "Value", type: "boolean" },
        { name: "activeColor", label: "Active Color", type: "color" },
        { name: "groupValue", label: "Group Value", type: "text" },
        {
          name: "labelPosition",
          label: "Label Position",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "labelColor", label: "Label Color", type: "color" },
      ];
    case "checkboxWithLabel":
      return [
        { name: "label", label: "Label Text", type: "text" },
        { name: "value", label: "Value", type: "boolean" },
        { name: "activeColor", label: "Active Color", type: "color" },
        {
          name: "labelPosition",
          label: "Label Position",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "labelColor", label: "Label Color", type: "color" },
      ];
    case "dynamicTable":
      return [
        { name: "title", label: "Table Title", type: "text" },
        { name: "columns", label: "Columns", type: "columns" },
        { name: "data", label: "Table Data", type: "json" },
        { name: "showHeader", label: "Show Header", type: "boolean" },
        { name: "showBorder", label: "Show Border", type: "boolean" },
        { name: "striped", label: "Striped Rows", type: "boolean" },
        { name: "sortable", label: "Sortable", type: "boolean" },
        { name: "headerColor", label: "Header Color", type: "color" },
        { name: "borderColor", label: "Border Color", type: "color" },
        { name: "evenRowColor", label: "Even Row Color", type: "color" },
        { name: "oddRowColor", label: "Odd Row Color", type: "color" },
      ];
    default:
      return [];
  }
}
