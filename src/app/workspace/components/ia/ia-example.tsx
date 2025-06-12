import { DesignElement } from "@/lib/types";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles } from "lucide-react";

type DesignElementWithoutId = Omit<DesignElement, 'id'>;

interface Example {
  addScreenIA: (name: string, elements?: DesignElementWithoutId[]) => string;
  isOpen: boolean;
  onClose: () => void;
}

function audioToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
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

export default function IaDesignModal({ isOpen, onClose, addScreenIA }: Example) {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'audio'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const clearAll = () => {
    setSelectedImage(null);
    setSelectedAudio(null);
    setTextPrompt("");
    setActiveTab('image');
    setIsRecording(false);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const handleClose = () => {
    onClose();
    clearAll();
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

  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea un archivo de audio
      if (!file.type.startsWith('audio/')) {
        alert('Por favor selecciona un archivo de audio válido');
        return;
      }

      // Validar tamaño (máximo 25MB - límite de Gemini)
      if (file.size > 25 * 1024 * 1024) {
        alert('El archivo de audio es demasiado grande. Máximo 25MB');
        return;
      }

      setSelectedAudio(file);

      // Crear URL para reproducir
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const clearAudio = () => {
    setSelectedAudio(null);
    setIsRecording(false);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });

        setSelectedAudio(file);

        // Crear URL para reproducir
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Detener el stream
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleGenerate = async () => {
    if (activeTab === 'image') {
      await generateWithImageIA();
    } else if (activeTab === 'text') {
      await generateWithPromptIA();
    } else if (activeTab === 'audio') {
      await generateWithAudioIA();
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
      const screenName = `ScreenIamge`;
      addScreenIA(screenName, elements as Omit<DesignElement, 'id'>[]);

      // Cerrar modal y limpiar
      handleClose();
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
      addScreenIA("ScreenIA", elements as Omit<DesignElement, 'id'>[]);

      // Cerrar modal y limpiar
      handleClose();
    } catch (error) {
      console.error("Error generando diseño:", error);
      alert("Error al generar el diseño. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const generateWithAudioIA = async () => {
    if (!selectedAudio) {
      alert('Por favor selecciona o graba un audio primero');
      return;
    }

    setLoading(true);
    try {
      const elements = await analyzeAudioAndGenerate(selectedAudio);
      const screenName = `ScreenAudio`;
      addScreenIA(screenName, elements as Omit<DesignElement, 'id'>[]);

      handleClose();
    } catch (error) {
      console.error("Error generando diseño desde audio:", error);
      alert("Error al procesar el audio. Inténtalo de nuevo.");
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

  const analyzeAudioAndGenerate = async (audioFile: File): Promise<any> => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY_IA ?? "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convertir audio a formato requerido
      const audioPart = await audioToGenerativePart(audioFile);

      const prompt = `
    Analyze this audio and generate a mobile UI screen based on the spoken description. Convert the audio content into design elements.

    **Analysis Instructions:**
    1. **Speech Recognition:** Transcribe and understand the spoken requirements
    2. **UI Interpretation:** Convert spoken descriptions into appropriate UI components
    3. **Layout Planning:** Create a logical layout based on the described functionality
    4. **Component Selection:** Choose appropriate components for the described features

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

    Analyze the audio and create the appropriate mobile UI elements based on what is described.
    `;

      console.log("Enviando audio a Gemini para análisis...");

      const result = await model.generateContent([prompt, audioPart]);
      const response = await result.response;
      const text = response.text();

      console.log("Respuesta de Gemini:", text);

      const jsonResponse = extractJsonFromString(text);
      return parseIAResponse(jsonResponse);
    } catch (error: any) {
      console.error(`\n❌ Error en el análisis de audio: ${error.message}`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            ✨ Generar Diseño con IA
          </h2>
          <button
            onClick={handleClose}
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
            className={`flex-1 py-3 px-4 text-center font-medium transition-all ${activeTab === 'image'
              ? 'border-b-2 border-purple-500 text-purple-400 bg-purple-500/10'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            disabled={loading}
          >
            🖼️ Desde Imagen
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all ${activeTab === 'text'
              ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            disabled={loading}
          >
            💭 Desde Texto
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all ${activeTab === 'audio'
              ? 'border-b-2 border-green-500 text-green-400 bg-green-500/10'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            disabled={loading}
          >
            🎤 Desde Audio
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
          ) : activeTab === 'text' ? (
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
          ) : (
            /* NUEVA SECCIÓN DE AUDIO */
            <div className="space-y-4">
              {/* Sección de grabación de audio */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-800/50">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className={`mx-auto h-12 w-12 ${isRecording ? 'text-red-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Controles de grabación */}
                  <div className="flex justify-center space-x-4 mb-4">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        🎤 Comenzar Grabación
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors animate-pulse"
                      >
                        ⏹️ Detener Grabación
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-gray-400 mb-4">O</div>

                  {/* Carga de archivo de audio */}
                  <div className="flex text-sm text-gray-300">
                    <label htmlFor="audio-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-green-400 hover:text-green-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 focus-within:ring-offset-gray-900 px-2 py-1">
                      <span>Sube un archivo de audio</span>
                      <input
                        ref={audioInputRef}
                        id="audio-upload"
                        name="audio-upload"
                        type="file"
                        className="sr-only"
                        accept="audio/*"
                        onChange={handleAudioSelect}
                        disabled={loading || isRecording}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">MP3, WAV, M4A, WebM hasta 25MB</p>
                </div>
              </div>

              {/* Reproductor de audio */}
              {audioUrl && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {selectedAudio?.name || 'Grabación de audio'}
                    </span>
                    <button
                      onClick={clearAudio}
                      className="text-red-400 hover:text-red-300 text-sm"
                      disabled={loading}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full"
                    style={{
                      backgroundColor: '#374151',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              )}

              {/* Estado de grabación */}
              {isRecording && (
                <div className="text-center text-red-400 animate-pulse">
                  🔴 Grabando... Habla ahora y describe la pantalla que quieres crear
                </div>
              )}

              {/* Información adicional */}
              <div className="text-sm text-gray-300 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <p className="font-medium mb-1 text-green-400">💡 Consejos para mejores resultados:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Habla claro y describe detalladamente la pantalla</li>
                  <li>Menciona todos los elementos que necesitas (botones, campos, etc.)</li>
                  <li>Incluye información sobre colores, disposición y funcionalidad</li>
                  <li>Evita ruidos de fondo durante la grabación</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>

          <Button
            onClick={handleGenerate}
            disabled={
              loading ||
              (activeTab === 'image' && !selectedImage) ||
              (activeTab === 'text' && !textPrompt.trim()) ||
              (activeTab === 'audio' && !selectedAudio)
            }
            className={`${activeTab === 'image'
              ? 'bg-purple-600 hover:bg-purple-700'
              : activeTab === 'text'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
              } text-white shadow-lg`}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">🌀</span>
                {activeTab === 'image' ? 'Analizando...' :
                  activeTab === 'text' ? 'Generando...' :
                    'Procesando...'}
              </span>
            ) : (
              <>
                {activeTab === 'image' ? '🖼️ Analizar Imagen' :
                  activeTab === 'text' ? '💭 Generar Diseño' :
                    '🎤 Procesar Audio'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}