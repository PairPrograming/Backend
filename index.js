require("dotenv").config();
const { conn } = require("./src/DbIndex");

// Import the app - THIS LINE WAS MISSING
const app = require("./src/app");

// Define port
const PORT = process.env.PORT || 4000;

// Connect to database before starting server
conn
  .authenticate()
  .then(() => {
    console.log("Conexión a la base de datos establecida");
    return conn.sync({ force: false }); // Set to true to reset DB on each start
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });
