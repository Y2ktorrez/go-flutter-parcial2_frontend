import { ComponentType } from "./types";

// Especificaciones corregidas basadas en las especificaciones reales de los dispositivos
export const devices = [
  {
    id: "samsungA10",
    label: "Samsung Galaxy A10",
    width: 360,
    height: 760,
    screenSize: '6.2"',
    resolution: "720 x 1520",
    aspectRatio: "19:9",
  },
  {
    id: "realme8_5g",
    label: "Realme 8 5G",
    width: 360,
    height: 800,
    screenSize: '6.5"',
    resolution: "1080 x 2400",
    aspectRatio: "20:9",
  },
  {
    id: "samsungS22Ultra",
    label: "Samsung Galaxy S22 Ultra",
    width: 412,
    height: 915,
    screenSize: '6.8"',
    resolution: "1440 x 3088",
    aspectRatio: "19.3:9",
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
      height: 1520,
    },
    pixelDensity: 271, // PPI
    aspectRatio: "19:9",
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
      height: 2400,
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
      height: 3088,
    },
    aspectRatio: "19.3:9",
  },
];

// Función para obtener dimensiones de viewport recomendadas
export const getViewportDimensions = (deviceId: string) => {
  const device = devicesDetailed.find((d) => d.id === deviceId);
  if (!device) return { width: 360, height: 760 };

  return {
    width: device.width,
    height: device.height,
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

export const getDefaultProperties = (type: ComponentType) => {
  switch (type) {
    case "button":
      return {
        text: "Button",
        variant: "primary",
        rounded: true,
        color: "#2196F3",
        textColor: "#FFFFFF",
        padding: 16,
        navigateTo: "",
      };
    case "label":
      return {
        text: "Label",
        fontSize: 14,
        fontWeight: "normal",
        color: "#000000",
        textAlign: "left",
      };
    case "textField":
      return {
        hint: "Enter text",
        label: "Label",
        hasIcon: false,
        icon: "search",
        validation: false,
        validationMessage: "Please enter a valid value",
      };
    case "card":
      return {
        elevation: 2,
        borderRadius: 8,
        color: "#FFFFFF",
        padding: 16,
        title: "Card Title",
        subtitle: "Card Subtitle",
        content:
          "This is the main content of the card. You can add any text or description here.",
        showImage: true,
        imageHeight: 120,
      };
    case "switch":
      return {
        value: false,
        activeColor: "#2196F3",
        inactiveColor: "#9E9E9E",
      };
    case "checkbox":
      return {
        value: false,
        activeColor: "#2196F3",
      };
    case "radio":
      return {
        value: false,
        activeColor: "#2196F3",
        groupValue: "option1",
      };
    case "chatInput":
      return {
        placeholder: "Type a message...",
        buttonText: "Send",
        buttonColor: "#2196F3",
      };
    case "chatMessage":
      return {
        text: "Hello! This is a sample message.",
        isUser: true,
        avatar: true,
        timestamp: true,
      };
    case "dropdown":
      return {
        label: "Select an option",
        placeholder: "Choose...",
        options: JSON.stringify([
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]),
        value: "",
        required: false,
        disabled: false,
        borderColor: "#d1d5db",
        backgroundColor: "#ffffff",
      };
    case "inputWithLabel":
      return {
        label: "Input Label",
        placeholder: "Enter text...",
        value: "",
        type: "text",
        required: false,
        disabled: false,
        borderColor: "#d1d5db",
        labelColor: "#374151",
      };
    case "switchWithLabel":
      return {
        label: "Toggle Switch",
        value: false,
        activeColor: "#2196F3",
        inactiveColor: "#9E9E9E",
        labelPosition: "right",
        disabled: false,
        labelColor: "#374151",
      };
    case "radioWithLabel":
      return {
        label: "Radio Option",
        value: false,
        activeColor: "#2196F3",
        groupValue: "option1",
        labelPosition: "right",
        disabled: false,
        labelColor: "#374151",
      };
    case "checkboxWithLabel":
      return {
        label: "Checkbox Option",
        value: false,
        activeColor: "#2196F3",
        labelPosition: "right",
        disabled: false,
        labelColor: "#374151",
      };
    case "dynamicTable":
      return {
        title: "Data Table",
        columns: JSON.stringify([
          { id: "name", title: "Name", width: 120 },
          { id: "email", title: "Email", width: 180 },
          { id: "role", title: "Role", width: 100 },
        ]),
        data: JSON.stringify([
          { name: "John Doe", email: "john@example.com", role: "Admin" },
          { name: "Jane Smith", email: "jane@example.com", role: "User" },
          { name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
        ]),
        showHeader: true,
        showBorder: true,
        striped: true,
        headerColor: "#f3f4f6",
        borderColor: "#e5e7eb",
        evenRowColor: "#ffffff",
        oddRowColor: "#f9fafb",
        sortable: true,
      };
    default:
      return {};
  }
};
