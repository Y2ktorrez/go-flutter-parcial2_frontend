import { ComponentType, PropertyConfig } from "./types";

// Especificaciones corregidas basadas en las especificaciones reales de los dispositivos
export const devices = [
  { 
    id: "samsungA10", 
    label: "Samsung Galaxy A10", 
    width: 360, 
    height: 760,
    screenSize: "6.2\"",
    resolution: "720 x 1520",
    aspectRatio: "19:9"
  },
  { 
    id: "realme8_5g", 
    label: "Realme 8 5G", 
    width: 360, 
    height: 800,
    screenSize: "6.5\"",
    resolution: "1080 x 2400",
    aspectRatio: "20:9"
  },
  { 
    id: "samsungS22Ultra", 
    label: "Samsung Galaxy S22 Ultra", 
    width: 412, 
    height: 915,
    screenSize: "6.8\"",
    resolution: "1440 x 3088",
    aspectRatio: "19.3:9"
  },
];

// Dimensiones más precisas para desarrollo web/móvil
export const devicesDetailed = [
  {
    id: "samsungA10",
    label: "Samsung Galaxy A10",
    // Dimensiones basadas en viewport común para dispositivos similares
    width: 360,
    height: 760,
    // Especificaciones reales del dispositivo
    physicalWidth: 75.6, // mm
    physicalHeight: 155.6, // mm
    screenSize: 6.2, // pulgadas
    resolution: {
      width: 720,
      height: 1520
    },
    pixelDensity: 271, // PPI
    aspectRatio: "19:9"
  },
  {
    id: "realme8_5g",
    label: "Realme 8 5G",
    // Dimensiones optimizadas para viewport
    width: 360,
    height: 800,
    // Especificaciones reales del dispositivo
    screenSize: 6.5, // pulgadas
    resolution: {
      width: 1080,
      height: 2400
    },
    aspectRatio: "20:9",
    // Nota: Dimensiones físicas no especificadas en la búsqueda
  },
  {
    id: "samsungS22Ultra",
    label: "Samsung Galaxy S22 Ultra",
    // Dimensiones para viewport (basadas en densidad de pixels común)
    width: 412,
    height: 915,
    // Especificaciones reales del dispositivo
    screenSize: 6.8, // pulgadas
    resolution: {
      width: 1440,
      height: 3088
    },
    aspectRatio: "19.3:9"
  }
];

// Función para obtener dimensiones de viewport recomendadas
export const getViewportDimensions = (deviceId: string) => {
  const device = devicesDetailed.find(d => d.id === deviceId);
  if (!device) return { width: 360, height: 760 };
  
  return {
    width: device.width,
    height: device.height
  };
};

// Get default width based on component type
export const getDefaultWidth = (type: ComponentType): number => {
  switch (type) {
    case "button":
      return 120;
    case "textField":
      return 200;
    case "card":
      return 300;
    case "list":
      return 300;
    case "icon":
      return 24;
    case "container":
      return 200;
    case "row":
      return 300;
    case "column":
      return 200;
    case "stack":
      return 200;
    case "switch":
      return 60;
    case "checkbox":
      return 24;
    case "radio":
      return 24;
    case "chatInput":
      return 300;
    case "chatMessage":
      return 250;
    case "dropdown":
      return 200;
    case "inputWithLabel":
      return 200;
    case "switchWithLabel":
      return 200;
    case "radioWithLabel":
      return 200;
    case "checkboxWithLabel":
      return 200;
    case "dynamicTable":
      return 350;
    case "label":
      return 200;
    default:
      return 100;
  }
};

// Get default height based on component type
export const getDefaultHeight = (type: ComponentType): number => {
  switch (type) {
    case "button":
      return 40;
    case "textField":
      return 56;
    case "card":
      return 200;
    case "list":
      return 300;
    case "icon":
      return 24;
    case "container":
      return 200;
    case "row":
      return 50;
    case "column":
      return 200;
    case "stack":
      return 200;
    case "switch":
      return 24;
    case "checkbox":
      return 24;
    case "radio":
      return 24;
    case "chatInput":
      return 50;
    case "chatMessage":
      return 80;
    case "dropdown":
      return 70;
    case "inputWithLabel":
      return 70;
    case "switchWithLabel":
      return 40;
    case "radioWithLabel":
      return 40;
    case "checkboxWithLabel":
      return 40;
    case "dynamicTable":
      return 200;
    case "label":
      return 24;
    default:
      return 50;
  }
};

// Get default properties based on component type
export const getDefaultProperties = (type: ComponentType): Record<string, any> => {
  switch (type) {
    case "button":
      return {
        text: "Button",
        color: "#007AFF",
        textColor: "#FFFFFF",
        padding: 12,
        rounded: true,
      };
    case "label":
      return {
        text: "Label",
        fontSize: 14,
        fontWeight: "normal",
        color: "#000000",
        textAlign: "left",
      };
    default:
      return {};
  }
};

export function getPropertyConfig(type: ComponentType): PropertyConfig[] {
  switch (type) {
    case "button":
      return [
        {
          name: "text",
          label: "Text",
          type: "text",
          required: true,
        },
        {
          name: "variant",
          label: "Variant",
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
        },
        {
          name: "rounded",
          label: "Rounded",
          type: "boolean",
        },
        {
          name: "color",
          label: "Color",
          type: "color",
        },
        {
          name: "textColor",
          label: "Text Color",
          type: "color",
        },
        {
          name: "padding",
          label: "Padding",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          name: "navigateTo",
          label: "Navigate To",
          type: "text",
        },
      ];
    case "textField":
      return [
        {
          name: "hint",
          label: "Hint",
          type: "text",
        },
        {
          name: "label",
          label: "Label",
          type: "text",
        },
        {
          name: "hasIcon",
          label: "Has Icon",
          type: "boolean",
        },
        {
          name: "icon",
          label: "Icon",
          type: "text",
        },
        {
          name: "validation",
          label: "Validation",
          type: "boolean",
        },
        {
          name: "validationMessage",
          label: "Validation Message",
          type: "text",
        },
      ];
    case "card":
      return [
        {
          name: "elevation",
          label: "Elevation",
          type: "number",
          min: 0,
          max: 10,
        },
        {
          name: "borderRadius",
          label: "Border Radius",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          name: "color",
          label: "Color",
          type: "color",
        },
        {
          name: "padding",
          label: "Padding",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          name: "title",
          label: "Title",
          type: "text",
        },
        {
          name: "subtitle",
          label: "Subtitle",
          type: "text",
        },
        {
          name: "content",
          label: "Content",
          type: "text",
        },
        {
          name: "showImage",
          label: "Show Image",
          type: "boolean",
        },
        {
          name: "imageHeight",
          label: "Image Height",
          type: "number",
          min: 0,
          max: 500,
        },
      ];
    case "icon":
      return [
        {
          name: "name",
          label: "Name",
          type: "text",
        },
        {
          name: "color",
          label: "Color",
          type: "color",
        },
        {
          name: "size",
          label: "Size",
          type: "number",
          min: 0,
          max: 100,
        },
      ];
    case "switch":
      return [
        {
          name: "value",
          label: "Value",
          type: "boolean",
        },
        {
          name: "activeColor",
          label: "Active Color",
          type: "color",
        },
        {
          name: "inactiveColor",
          label: "Inactive Color",
          type: "color",
        },
      ];
    case "checkbox":
      return [
        {
          name: "value",
          label: "Value",
          type: "boolean",
        },
        {
          name: "activeColor",
          label: "Active Color",
          type: "color",
        },
      ];
    case "radio":
      return [
        {
          name: "value",
          label: "Value",
          type: "boolean",
        },
        {
          name: "activeColor",
          label: "Active Color",
          type: "color",
        },
        {
          name: "groupValue",
          label: "Group Value",
          type: "text",
        },
      ];
    case "chatInput":
      return [
        {
          name: "placeholder",
          label: "Placeholder",
          type: "text",
        },
        {
          name: "buttonText",
          label: "Button Text",
          type: "text",
        },
        {
          name: "buttonColor",
          label: "Button Color",
          type: "color",
        },
      ];
    case "chatMessage":
      return [
        {
          name: "text",
          label: "Text",
          type: "text",
        },
        {
          name: "isUser",
          label: "Is User",
          type: "boolean",
        },
        {
          name: "avatar",
          label: "Avatar",
          type: "boolean",
        },
        {
          name: "timestamp",
          label: "Timestamp",
          type: "boolean",
        },
      ];
    case "dropdown":
      return [
        {
          name: "label",
          label: "Label",
          type: "text",
        },
        {
          name: "placeholder",
          label: "Placeholder",
          type: "text",
        },
        {
          name: "options",
          label: "Options",
          type: "json",
        },
        {
          name: "value",
          label: "Value",
          type: "text",
        },
        {
          name: "required",
          label: "Required",
          type: "boolean",
        },
        {
          name: "disabled",
          label: "Disabled",
          type: "boolean",
        },
        {
          name: "borderColor",
          label: "Border Color",
          type: "color",
        },
        {
          name: "backgroundColor",
          label: "Background Color",
          type: "color",
        },
      ];
    case "inputWithLabel":
      return [
        {
          name: "label",
          label: "Label",
          type: "text",
        },
        {
          name: "placeholder",
          label: "Placeholder",
          type: "text",
        },
        {
          name: "value",
          label: "Value",
          type: "text",
        },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Text", value: "text" },
            { label: "Password", value: "password" },
          ],
        },
        {
          name: "required",
          label: "Required",
          type: "boolean",
        },
        {
          name: "disabled",
          label: "Disabled",
          type: "boolean",
        },
        {
          name: "borderColor",
          label: "Border Color",
          type: "color",
        },
        {
          name: "labelColor",
          label: "Label Color",
          type: "color",
        },
      ];
    case "switchWithLabel":
      return [
        {
          name: "label",
          label: "Label",
          type: "text",
        },
        {
          name: "value",
          label: "Value",
          type: "boolean",
        },
        {
          name: "activeColor",
          label: "Active Color",
          type: "color",
        },
        {
          name: "inactiveColor",
          label: "Inactive Color",
          type: "color",
        },
        {
          name: "labelPosition",
          label: "Label Position",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        {
          name: "disabled",
          label: "Disabled",
          type: "boolean",
        },
        {
          name: "labelColor",
          label: "Label Color",
          type: "color",
        },
      ];
    case "radioWithLabel":
      return [
        {
          name: "label",
          label: "Label",
          type: "text",
        },
        {
          name: "value",
          label: "Value",
          type: "boolean",
        },
        {
          name: "activeColor",
          label: "Active Color",
          type: "color",
        },
        {
          name: "groupValue",
          label: "Group Value",
          type: "text",
        },
        {
          name: "labelPosition",
          label: "Label Position",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        {
          name: "disabled",
          label: "Disabled",
          type: "boolean",
        },
        {
          name: "labelColor",
          label: "Label Color",
          type: "color",
        },
      ];
    case "checkboxWithLabel":
      return [
        {
          name: "label",
          label: "Label",
          type: "text",
        },
        {
          name: "value",
          label: "Value",
          type: "boolean",
        },
        {
          name: "activeColor",
          label: "Active Color",
          type: "color",
        },
        {
          name: "labelPosition",
          label: "Label Position",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        {
          name: "disabled",
          label: "Disabled",
          type: "boolean",
        },
        {
          name: "labelColor",
          label: "Label Color",
          type: "color",
        },
      ];
    case "dynamicTable":
      return [
        {
          name: "title",
          label: "Title",
          type: "text",
        },
        {
          name: "columns",
          label: "Columns",
          type: "json",
        },
        {
          name: "data",
          label: "Data",
          type: "json",
        },
        {
          name: "showHeader",
          label: "Show Header",
          type: "boolean",
        },
        {
          name: "showBorder",
          label: "Show Border",
          type: "boolean",
        },
        {
          name: "striped",
          label: "Striped",
          type: "boolean",
        },
        {
          name: "headerColor",
          label: "Header Color",
          type: "color",
        },
        {
          name: "borderColor",
          label: "Border Color",
          type: "color",
        },
        {
          name: "evenRowColor",
          label: "Even Row Color",
          type: "color",
        },
        {
          name: "oddRowColor",
          label: "Odd Row Color",
          type: "color",
        },
        {
          name: "sortable",
          label: "Sortable",
          type: "boolean",
        },
      ];
    case "label":
      return [
        {
          name: "text",
          label: "Text Content",
          type: "text",
          required: true,
          defaultValue: "Label",
          placeholder: "Enter text here",
          description: "The text content to display in the label"
        },
        {
          name: "fontSize",
          label: "Font Size",
          type: "number",
          min: 8,
          max: 72,
          defaultValue: 14,
          step: 1,
          description: "Size of the text in pixels"
        },
        {
          name: "fontWeight",
          label: "Font Weight",
          type: "select",
          defaultValue: "normal",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Bold", value: "bold" }
          ],
          description: "Weight/boldness of the text"
        },
        {
          name: "color",
          label: "Text Color",
          type: "color",
          defaultValue: "#000000",
          description: "Color of the text"
        },
        {
          name: "textAlign",
          label: "Text Alignment",
          type: "select",
          defaultValue: "left",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" }
          ],
          description: "Horizontal alignment of the text"
        }
      ];
    default:
      return [];
  }
}