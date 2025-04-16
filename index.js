// Al inicio de index.js, después de las importaciones
const { conn } = require('./src/DbIndex');

// Resto de tu configuración de Express...

// Al final de index.js, reemplaza tu app.listen con esto:
const PORT = process.env.PORT || 4000;

// Conectar a la base de datos antes de iniciar el servidor
conn.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida');
    return conn.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });