import { DesignElement } from "@/lib/types";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

type DesignElementWithoutId = Omit<DesignElement, 'id'>;

interface Example {
  addScreenIA: (name: string, elements?: DesignElementWithoutId[]) => string;
}

// Función para extraer JSON de un string
function extractJsonFromString(str: string): any {
  try {
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

// Función para convertir archivo a base64
function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function IaDesignModal({ addScreenIA }: Example) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    clearAll();
  };

  const clearAll = () => {
    setSelectedImage(null);
    setTextPrompt("");
    setActiveTab('image');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 10MB');
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (activeTab === 'image') {
      await generateWithImageIA();
    } else {
      await generateWithPromptIA();
    }
  };

  const generateWithImageIA = async () => {
    if (!selectedImage) {
      alert('Por favor selecciona una imagen primero');
      return;
    }

    setLoading(true);
    try {
      // Analizar la imagen y generar elementos
      const elements = await analyzeImageAndGenerate(selectedImage);
      
      // Crear pantalla con los elementos generados
      const screenName = `Pantalla de ${selectedImage.name.split('.')[0]}`;
      addScreenIA(screenName, elements as Omit<DesignElement, 'id'>[]);
      
      // Cerrar modal y limpiar
      closeModal();
    } catch (error) {
      console.error("Error generando diseño desde imagen:", error);
      alert("Error al procesar la imagen. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const generateWithPromptIA = async () => {
    if (!textPrompt.trim()) {
      alert('Por favor ingresa una descripción');
      return;
    }

    setLoading(true);
    try {
      const elements = await fetchIAComponents(textPrompt);
      addScreenIA("Pantalla generada por IA", elements as Omit<DesignElement, 'id'>[]);
      
      // Cerrar modal y limpiar
      closeModal();
    } catch (error) {
      console.error("Error generando diseño:", error);
      alert("Error al generar el diseño. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Función para analizar imagen y generar componentes
  const analyzeImageAndGenerate = async (imageFile: File): Promise<any> => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY_IA ?? "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convertir imagen a formato requerido
      const imagePart = await fileToGenerativePart(imageFile);

      const prompt = `
      Analyze this image and generate a mobile UI screen based on what you see. Extract any text, UI elements, layout structure, and convert them into a JSON array of design elements.

      **Analysis Instructions:**
      1. **Text Extraction:** Identify all text in the image and use it for labels, buttons, headings, etc.
      2. **Layout Recognition:** Understand the visual hierarchy and positioning of elements
      3. **UI Components:** Convert visual elements to appropriate component types
      4. **Color Analysis:** Use colors that match or complement the image

      **Critical Rules:**
      1. **NO NESTING:** All elements MUST be root-level. DO NOT use "children" property at all.
      2. **Component Types:** ONLY use these ComponentType values: 
        "button", "textField", "card", "label", 
        "switch", "checkbox", "radio", "chatInput", "chatMessage", "dropdown", 
        "inputWithLabel", "switchWithLabel", "radioWithLabel", "checkboxWithLabel", "dynamicTable".

      3. **No IDs:** DO NOT include "id" property (will be auto-generated).

      4. **Required Properties:** 
        - ALL elements MUST include ALL default properties for their type
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
        }
      ]

      Analyze the image and create the appropriate mobile UI elements based on what you see.
      `;

      console.log("Enviando imagen a Gemini para análisis...");

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      console.log("Respuesta de Gemini:", text);

      // Extraer el JSON de la respuesta
      const jsonResponse = extractJsonFromString(text);

      // Parsear y limpiar la respuesta
      return parseIAResponse(jsonResponse);
    } catch (error: any) {
      console.error(`\n❌ Error en el análisis de imagen: ${error.message}`);
      console.error("Detalles:", error);
      throw error;
    }
  };

  // Función original para generar por prompt de texto
  const fetchIAComponents = async (prompt: string): Promise<any> => {
    try {
      const systemPrompt = `
      You are an expert mobile UI designer. Generate an array of Omit<DesignElement, 'id'>[] objects for a screen based on the user's description.

      **Critical Rules:**
      1. **NO NESTING:** All elements MUST be root-level. DO NOT use "children" property at all.
      2. **Component Types:** ONLY use these ComponentType values: 
        "button", "textField", "card", "label", 
        "switch", "checkbox", "radio", "chatInput", "chatMessage", "dropdown", 
        "inputWithLabel", "switchWithLabel", "radioWithLabel", "checkboxWithLabel", "dynamicTable".

      3. **No IDs:** DO NOT include "id" property (will be auto-generated).

      4. **Required Properties:** 
        - ALL elements MUST include ALL default properties for their type
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

      **User Description:**
      ${prompt}
      `;

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY_IA ?? "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      const jsonResponse = extractJsonFromString(text);
      return parseIAResponse(jsonResponse);
    } catch (error: any) {
      console.error(`\n❌ Error en la solicitud a Gemini: ${error.message}`);
      throw error;
    }
  };

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
  };
  
  return (
    <>
      {/* Botón para abrir el modal */}
      <div className="p-4">
        <Button
          onClick={openModal}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        >
          ✨ Diseñar con IA
        </Button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                ✨ Generar Diseño con IA
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-200 text-2xl transition-colors"
                disabled={loading}
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                  activeTab === 'image'
                    ? 'border-b-2 border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
                disabled={loading}
              >
                🖼️ Desde Imagen
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                  activeTab === 'text'
                    ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
                disabled={loading}
              >
                💭 Desde Texto
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {activeTab === 'image' ? (
                <div className="space-y-4">
                  {/* Sección de carga de imagen */}
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-800/50">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="flex text-sm text-gray-300">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 focus-within:ring-offset-gray-900 px-2 py-1">
                          <span>Sube una imagen</span>
                          <input
                            ref={fileInputRef}
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageSelect}
                            disabled={loading}
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, WebP hasta 10MB</p>
                    </div>
                  </div>

                  {/* Preview de la imagen seleccionada */}
                  {previewUrl && (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="text-sm text-gray-300 bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                    <p className="font-medium mb-1 text-purple-400">💡 Consejos para mejores resultados:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Sube mockups, sketches o capturas de pantalla</li>
                      <li>Las imágenes con texto claro funcionan mejor</li>
                      <li>Se analizará la estructura visual y el texto presente</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Campo de texto para el prompt */}
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                      Describe la pantalla que quieres crear:
                    </label>
                    <textarea
                      id="prompt"
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Ej: Pantalla de perfil de usuario con avatar, información básica, formulario de edición y botones de acción..."
                      className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-white placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>

                  {/* Información adicional */}
                  <div className="text-sm text-gray-300 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                    <p className="font-medium mb-1 text-blue-400">💡 Consejos para mejores resultados:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Sé específico con los elementos que necesitas</li>
                      <li>Menciona el tipo de pantalla (login, perfil, lista, etc.)</li>
                      <li>Incluye detalles sobre colores o estilos si los tienes</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              
              <Button
                onClick={handleGenerate}
                disabled={loading || (activeTab === 'image' && !selectedImage) || (activeTab === 'text' && !textPrompt.trim())}
                className={`${
                  activeTab === 'image' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white shadow-lg`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">🌀</span>
                    {activeTab === 'image' ? 'Analizando...' : 'Generando...'}
                  </span>
                ) : (
                  <>
                    {activeTab === 'image' ? '🖼️ Analizar Imagen' : '💭 Generar Diseño'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}