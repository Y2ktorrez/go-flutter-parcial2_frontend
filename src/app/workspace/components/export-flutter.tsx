import JSZip from "jszip";
import { saveAs } from "file-saver";

// Configuración
const PROJECT_DIR = 'mi_flutter_app';

// Función para generar el ZIP
export const generateAndDownloadZip = (flutterCode: string) => {
  const zip = new JSZip();
  
  // 1. Agregar main.dart
  zip.file("main.dart", flutterCode);
  
  // 2. Agregar el script de configuración (corregido)
  zip.file("setup_flutter_project.js", generateNodeScript());
  
  // 3. Agregar README actualizado
  zip.file("README.txt", generateReadmeContent());
  
  // 4. Generar y descargar
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "flutter_project.zip");
  });
};

// Genera el script Node.js corregido
const generateNodeScript = () => {
  return `const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración
const PROJECT_DIR = '${PROJECT_DIR}';
const MAIN_DART_PATH = path.join(PROJECT_DIR, 'lib', 'main.dart');

// Función mejorada para ejecutar comandos
const runCommand = (command, errorMessage) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(\`❌ \${errorMessage}: \${error.message}\`);
        console.error(\`🔍 Detalles: \${stderr}\`);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
};

// Función principal
const setupFlutterProject = async () => {
  console.log('================================');
  console.log('   FLUTTER PROJECT GENERATOR');
  console.log('================================');
  console.log();

  try {
    // 1. Verificar Flutter instalado
    console.log('🔍 Verificando instalación de Flutter...');
    await runCommand('flutter --version', 'Flutter no está instalado o no está en el PATH');
    console.log('✅ Flutter está correctamente instalado');

    // 2. Crear/actualizar proyecto
    if (!fs.existsSync(PROJECT_DIR)) {
      console.log('🛠 Creando nuevo proyecto Flutter...');
      await runCommand(\`flutter create \${PROJECT_DIR}\`, 'Error al crear proyecto');
      console.log('✅ Proyecto creado exitosamente');
    } else {
      console.log('ℹ️  El proyecto ya existe, actualizando...');
    }

    // 3. Copiar archivo principal
    await copyMainDart();

    // 4. Instalar dependencias
    await installDependencies();

    // 5. Preguntar si ejecutar la app
    promptForAppRun();
    
  } catch (error) {
    console.error('🚨 ERROR CRÍTICO: El proceso no pudo completarse');
    console.log('💡 Soluciones posibles:');
    console.log('1. Verifica que Flutter esté instalado: https://flutter.dev');
    console.log('2. Ejecuta "flutter doctor" para diagnosticar problemas');
    console.log('3. Asegúrate de tener permisos de escritura en este directorio');
    process.exit(1);
  }
};

// Copiar archivo principal (corregido)
const copyMainDart = async () => {
  try {
    const currentDir = process.cwd();
    const sourceDart = path.join(currentDir, 'main.dart');
    
    if (!fs.existsSync(sourceDart)) {
      throw new Error('No se encontró main.dart en el directorio actual');
    }

    // Crear directorio lib si no existe
    const libDir = path.join(PROJECT_DIR, 'lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }

    fs.copyFileSync(sourceDart, MAIN_DART_PATH);
    console.log('✅ main.dart copiado correctamente');
    
  } catch (error) {
    console.error('❌ ERROR copiando main.dart:', error.message);
    console.log('Asegúrate de que:');
    console.log('1. El archivo main.dart está en esta misma carpeta');
    console.log('2. Tienes permisos de escritura');
    throw error;
  }
};

// Instalar dependencias (corregido)
const installDependencies = async () => {
  try {
    console.log('📦 Instalando dependencias...');
    await runCommand(\`cd \${PROJECT_DIR} && flutter pub get\`, 'Error instalando dependencias');
    console.log('✅ Dependencias instaladas correctamente');
  } catch (error) {
    console.error('💡 Intenta solucionarlo manualmente con:');
    console.log(\`cd \${PROJECT_DIR} && flutter pub get\`);
    throw error;
  }
};

// Preguntar si ejecutar la app (corregido)
const promptForAppRun = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\\n¿Deseas ejecutar la aplicación ahora? (s/n): ', (answer) => {
    if (answer.toLowerCase() === 's') {
      console.log('🚀 Iniciando aplicación...');
      exec(\`cd \${PROJECT_DIR} && flutter run\`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error ejecutando la app:', error.message);
          console.error('🔍 Detalles:', stderr);
        } else {
          console.log(stdout);
        }
        rl.close();
      });
    } else {
      console.log('⚠️  Puedes ejecutar manualmente con:');
      console.log(\`   cd \${PROJECT_DIR} && flutter run\`);
      rl.close();
    }
  });
};

// Ejecutar el proceso principal
setupFlutterProject();`;
};

// README actualizado
const generateReadmeContent = () => {
  return `INSTRUCCIONES PARA EJECUTAR EL PROYECTO FLUTTER

📋 REQUISITOS PREVIOS
===================
✅ Node.js v14+ instalado
✅ Flutter SDK instalado y configurado en PATH

🚀 PASOS DE INSTALACIÓN
======================

1. EXTRACCIÓN:
   - Extrae TODO el contenido del ZIP en una carpeta

2. EJECUCIÓN:
   - Abre una terminal en la carpeta
   - Ejecuta: node setup_flutter_project.js

3. EL SCRIPT HARÁ:
   - Verificará que Flutter esté instalado
   - Creará el proyecto Flutter
   - Copiará tu código personalizado
   - Instalará dependencias
   - Preguntará si quieres ejecutar la app

🔧 SOLUCIÓN DE PROBLEMAS COMUNES
===============================

❌ "Flutter no encontrado":
   → Verifica con: flutter doctor
   → Añade Flutter al PATH

❌ "Error al copiar main.dart":
   → Verifica que el archivo existe
   → Ejecuta en la misma carpeta donde está el ZIP extraído

❌ "Error de permisos":
   → En Linux/macOS: sudo chmod +x setup_flutter_project.js
   → En Windows: Ejecuta como administrador

❌ "Dependencias no instaladas":
   → Ejecuta manualmente: 
        cd ${PROJECT_DIR} 
        flutter pub get

📱 COMANDOS ÚTILES
=================
🔄 Actualizar dependencias: 
   cd ${PROJECT_DIR} && flutter pub get

🚀 Ejecutar app: 
   cd ${PROJECT_DIR} && flutter run

📦 Build para Android: 
   cd ${PROJECT_DIR} && flutter build apk

🌐 Ejecutar en web: 
   cd ${PROJECT_DIR} && flutter run -d chrome

🎉 ¡LISTO!`;
};

// Componente de botón mejorado
export const DownloadZipButton = ({ flutterCode }: { flutterCode: string }) => {
  const handleDownload = () => {
    if (!flutterCode || flutterCode.trim() === '') {
      alert('Por favor, escribe código Flutter válido antes de descargar.');
      return;
    }
    
    try {
      generateAndDownloadZip(flutterCode);
      alert('✅ Descarga iniciada! Encuentra el ZIP en tu carpeta de descargas');
    } catch (error: any) {
      alert('❌ Error al generar el proyecto: ' + error.message);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
      title="Descarga un proyecto Flutter completo listo para ejecutar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      Exportar proyecto
    </button>
  );
};