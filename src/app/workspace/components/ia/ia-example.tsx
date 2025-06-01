import { DesignElement } from "@/lib/types";
import { Button } from "../ui/button";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

type DesignElementWithoutId = Omit<DesignElement, 'id'>;

interface Example {
  addScreenIA: (name: string, elements?: DesignElementWithoutId[]) => string;
}


// Función para extraer JSON de un string
function extractJsonFromString(str: string): any {
  try {
    // Intenta encontrar un array JSON
    const startIndex = str.indexOf('[');
    const endIndex = str.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No se encontró un array JSON");
    }
    const jsonString = str.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error extrayendo JSON:", error);
    throw error;
  }
}

export default function IaExample({ addScreenIA }: Example) {
  const [loading, setLoading] = useState(false);

  const generateWithIA = async () => {
    setLoading(true);
    try {
      // 1. Obtener prompt del usuario
      const userPrompt = "Pantalla de perfil de usuario con avatar, información básica y botones de acción";
      
      // 2. Llamar al servicio de IA
      const elements = await fetchIAComponents(userPrompt);
      
      // 3. Crear pantalla con los elementos generados
      addScreenIA("Pantalla generada por IA", elements as Omit<DesignElement, 'id'>[]);
    } catch (error) {
      console.error("Error generando diseño:", error);
    } finally {
      setLoading(false);
    }
  }

  // Función para llamar a Gemini
  const fetchIAComponents = async (prompt: string) : Promise<any> => {
    try {
      // Construir el prompt completo
      // ! Tener en cuenta la pantalla
      // ! Tener en cuenta los atributos de cada componente para el contexto del prompt
      const systemPrompt = `
      You are an expert mobile UI designer. Generate an array of Omit<DesignElement, 'id'>[] objects for a screen based on the user's description.

      **Critical Rules:**
      1. **NO NESTING:** All elements MUST be root-level. DO NOT use "children" property at all.
      2. **Component Types:** ONLY use these ComponentType values: 
        "button", "textField", "card", "icon", 
        "switch", "checkbox", "radio", "chatInput", "chatMessage", "dropdown", 
        "inputWithLabel", "switchWithLabel", "radioWithLabel", "checkboxWithLabel", "dynamicTable".

      3. **No IDs:** DO NOT include "id" property (will be auto-generated).

      4. **Required Properties:** 
        - ALL elements MUST include ALL default properties for their type
        - For containers: MUST include padding, color, borderRadius
        - For text/input: MUST include fontSize, padding
        - For buttons: MUST include padding, color, textColor

      5. **Coordinates & Dimensions:**
        - x, y: Absolute position in pixels (0-360 width, 0-640 height)
        - width, height: Logical dimensions (match component content)
        - Minimum spacing: 10px between elements

      6. **Structured Data:**
        - Use JSON.stringify() for: options, columns, data
        - Maintain property types: 
          - color: hex string (#RRGGBB)
          - size: number (pixels)
          - padding: number (pixels)

      7. **Output Format:**
        - Return ONLY pure JSON array
        - NO explanations, comments or markdown
        - Ensure valid JSON syntax (double quotes)

      **Response Example (JSON ONLY):**
      [
        {
          "type": "container",
          "x": 20,
          "y": 50,
          "width": 320,
          "height": 500,
          "properties": {
            "color": "#F5F5F5",
            "padding": 16,
            "borderRadius": 8
          }
        },
        {
          "type": "textField",
          "x": 40,
          "y": 180,
          "width": 240,
          "height": 60,
          "properties": {
            "label": "Full Name",
            "hint": "Enter your name",
            "padding": 12,
            "fontSize": 16,
            "borderColor": "#CCCCCC"
          }
        },
        {
          "type": "button",
          "x": 40,
          "y": 260,
          "width": 120,
          "height": 45,
          "properties": {
            "text": "Save Profile",
            "color": "#4CAF50",
            "textColor": "#FFFFFF",
            "padding": 16,
            "rounded": true
          }
        }
      ]

      **User Description:**
      ${prompt}
      `;

      // Inicializar el cliente de Gemini
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY_IA ?? "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      console.log("Enviando prompt a Gemini:", systemPrompt);

      // Enviar la solicitud
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      console.log("Respuesta de Gemini:", text);

      // Extraer el JSON de la respuesta
      const jsonResponse = extractJsonFromString(text);

      // Parsear y limpiar la respuesta
      return parseIAResponse(jsonResponse);
    } catch (error: any) {
      console.error(`\n❌ Error en la solicitud a Gemini: ${error.message}`);
      console.error("Detalles:", error);
      
      // En caso de error, usar un diseño predeterminado
      return [
        {
          type: "container",
          x: 20,
          y: 50,
          width: 320,
          height: 500,
          properties: { 
            color: "#F5F5F5",
            padding: 16,
            borderRadius: 8
          }
        },
        {
          type: "icon",
          x: 140,
          y: 80,
          width: 80,
          height: 80,
          properties: {
            name: "user",
            size: 64,
            color: "#2196F3"
          }
        },
        {
          type: "textField",
          x: 40,
          y: 180,
          width: 240,
          height: 60,
          properties: {
            label: "Nombre completo",
            hint: "Ingrese su nombre completo",
            padding: 12,
            fontSize: 16
          }
        },
        {
          type: "button",
          x: 40,
          y: 260,
          width: 120,
          height: 45,
          properties: {
            text: "Guardar",
            color: "#4CAF50",
            textColor: "#FFFFFF",
            padding: 16
          }
        }
      ];
    }
  }

  // Valida y transforma la respuesta de la IA
  // Valida y transforma la respuesta de la IA
const parseIAResponse = (response: any): DesignElementWithoutId[] => {
  if (!Array.isArray(response)) {
    throw new Error("La IA debe devolver un array");
  }

  return response.map((element: any) => {
    // Eliminar children si existen
    const { children, ...cleanElement } = element;
    
    // Validar coordenadas
    if (cleanElement.x < 0 || cleanElement.x > 360) cleanElement.x = 20;
    if (cleanElement.y < 0 || cleanElement.y > 640) cleanElement.y = 30;
    
    // Asegurar propiedades mínimas
    if (!cleanElement.properties) {
      cleanElement.properties = {};
    }
    
    // Agregar propiedades críticas faltantes
    switch (cleanElement.type) {
      case "container":
        if (!("padding" in cleanElement.properties)) {
          cleanElement.properties.padding = 16;
        }
        if (!("color" in cleanElement.properties)) {
          cleanElement.properties.color = "#F0F0F0";
        }
        break;
        
      case "button":
        if (!("padding" in cleanElement.properties)) {
          cleanElement.properties.padding = 16;
        }
        if (!("color" in cleanElement.properties)) {
          cleanElement.properties.color = "#2196F3";
        }
        break;
        
      case "textField":
      case "inputWithLabel":
        if (!("padding" in cleanElement.properties)) {
          cleanElement.properties.padding = 12;
        }
        break;
    }
    
    // Convertir propiedades críticas a tipos correctos
    if ("padding" in cleanElement.properties) {
      cleanElement.properties.padding = Number(cleanElement.properties.padding);
    }
    
    if ("fontSize" in cleanElement.properties) {
      cleanElement.properties.fontSize = Number(cleanElement.properties.fontSize);
    }
    
    return cleanElement;
  });
}
  
  return (
    <div className="p-4">
      <Button
        onClick={generateWithIA}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2">🌀</span>
            Generando...
          </span>
        ) : "Diseñar con IA"}
      </Button>
    </div>
  );
}