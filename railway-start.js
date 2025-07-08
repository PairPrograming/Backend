const { exec } = require('child_process');
const { conn } = require('./src/DbIndex');
const fs = require('fs');

// Archivos de log
const jsonLogFile = 'server-log.json';
const binaryLogFile = 'server-log.dat';

// Verificar y crear los archivos si no existen
function ensureFileExists(filename, initialContent) {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, initialContent);
  }
}

// Asegurar que el log en JSON sea un array
ensureFileExists(jsonLogFile, '[]');
ensureFileExists(binaryLogFile, '');

// Función para registrar eventos en JSON y binario
function logEvent(type, message) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message
  };

  // Leer el JSON existente y agregar el nuevo evento
  let logs = JSON.parse(fs.readFileSync(jsonLogFile, 'utf8'));
  logs.push(logEntry);
  fs.writeFileSync(jsonLogFile, JSON.stringify(logs, null, 2));

  // Guardar el mismo evento en binario
  fs.appendFileSync(binaryLogFile, Buffer.from(JSON.stringify(logEntry) + '\n'));

  console.log(`[${type}] ${message}`);
}

// Manejo de errores con log
process.on('uncaughtException', (error) => {
  logEvent('ERROR', `Error no capturado: ${error.stack}`);
});

process.on('unhandledRejection', (reason) => {
  logEvent('ERROR', `Promesa rechazada: ${reason}`);
});

// Probar conexión a la base de datos con log
logEvent('INFO', 'Intentando conectar a la base de datos...');
conn.authenticate()
  .then(() => {
    logEvent('INFO', 'Conexión a la base de datos establecida.');
    
    // Sincronizar modelos con log
    logEvent('INFO', 'Sincronizando modelos...');
    return conn.sync({ alter: true });
  })
  .then(() => {
    logEvent('INFO', 'Modelos sincronizados.');

    // Iniciar la aplicación con log
    logEvent('INFO', 'Iniciando aplicación...');
    const child = exec('node index.js');

    child.stdout.on('data', (data) => {
      logEvent('INFO', `Salida del proceso hijo: ${data}`);
    });

    child.stderr.on('data', (data) => {
      logEvent('ERROR', `Error en ejecución: ${data}`);
    });

    child.on('close', (code) => {
      logEvent('INFO', `Proceso hijo terminado con código ${code}`);
    });
  })
  .catch(err => {
    logEvent('ERROR', `Error en la configuración de la base de datos: ${err.stack}`);
    process.exit(1);
  });