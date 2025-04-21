
const { exec } = require('child_process');
const { conn } = require('./src/DbIndex');

// Configurar manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

// Probar conexión a la base de datos
console.log('Intentando conectar a la base de datos...');
conn.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida.');
    
    // Sincronizar modelos
    console.log('Sincronizando modelos...');
    return conn.sync({ alter: true });
  })
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
    
    // Iniciar la aplicación
    console.log('Iniciando aplicación...');
    const child = exec('node index.js');
    
    child.stdout.on('data', (data) => {
      console.log(data);
    });
    
    child.stderr.on('data', (data) => {
      console.error(data);
    });
    
    child.on('close', (code) => {
      console.log(`Proceso hijo terminado con código ${code}`);
    });
  })
  .catch(err => {
    console.error('Error al configurar la base de datos:', err);
    process.exit(1);
  });