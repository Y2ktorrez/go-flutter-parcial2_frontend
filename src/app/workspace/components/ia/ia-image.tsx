import { useState } from 'react';

// Instala el SDK con: npm install @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";

const IaImage = () => {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");

  const handleGeminiRequest = async () => {
    if (!apiKey) {
      console.error("❌ Error: API Key no proporcionada");
      return;
    }
    
    if (!input.trim()) {
      console.error("❌ Error: Escribe una consulta antes de enviar");
      return;
    }

    setIsLoading(true);
    console.log(`\n[${new Date().toLocaleTimeString()}] Enviando consulta a Gemini...`);
    console.log(`Consulta: "${input}"`);

    try {
      // Inicializar el cliente de Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Enviar la solicitud
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      // Mostrar resultados en consola
      console.log(`\n[${new Date().toLocaleTimeString()}] Respuesta de Gemini:`);
      console.log(text);
      console.log("----------------------------------------");
      
    } catch (error: any) {
      console.error(`\n❌ Error en la solicitud a Gemini: ${error.message}`);
      console.error("Detalles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Gemini API Console</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key de Google AI Studio:
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingresa tu API Key"
        />
        <p className="mt-1 text-sm text-gray-500">
          Obtén tu API key en:{" "}
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Consulta para Gemini:
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Escribe tu consulta aquí..."
        />
      </div>

      <div className="flex items-center">
        <button
          onClick={handleGeminiRequest}
          disabled={isLoading || !apiKey}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isLoading || !apiKey
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            "Enviar a Gemini"
          )}
        </button>

        <button
          onClick={() => console.clear()}
          className="ml-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Limpiar Consola
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">Instrucciones:</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Los resultados se mostrarán en la consola de tu navegador (F12)</li>
          <li>Mantén tu API Key segura - no la compartas</li>
          <li>Ejemplo de consultas: "Explica la teoría de la relatividad", "Genera código para un componente React"</li>
          <li>Puedes usar el botón "Limpiar Consola" para borrar mensajes anteriores</li>
        </ul>
      </div>
    </div>
  );
};

export default IaImage;