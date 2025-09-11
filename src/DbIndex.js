const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const Ordendetalle = require("./models/Ordendetalle");
require("dotenv").config();

const { LINKDB } = process.env;
const { DATABASE_URL } = process.env;

// const sequelize = new Sequelize(LINKDB, {
//   logging: false,
//   native: false,
// });

const sequelize = new Sequelize(
  process.env.NODE_ENV === 'production' 
    ? process.env.DATABASE_URL 
    : process.env.LINKDB, // ← Usa local en desarrollo
  {
    logging: false,
    native: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  }
);

const modelDefiners = [];

// Función recursiva para leer modelos en carpetas y subcarpetas
const readModels = (folderPath) => {
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Si es una carpeta, llamamos recursivamente a la función para leer modelos en esa carpeta
      readModels(filePath);
    } else if (file.slice(-3) === ".js") {
      // Si es un archivo JavaScript en la carpeta, lo agregamos a los modelDefiners
      modelDefiners.push(require(filePath));
    }
  });
};

// Llamamos a la función inicialmente con la ruta de la carpeta 'models'
readModels(path.join(__dirname, "/models"));

// Injectamos la conexión (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));

// Capitalizamos los nombres de los modelos
const entries = Object.entries(sequelize.models);
const capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// Log de los modelos cargados
console.log(sequelize.models);

// Destructuring de los modelos
const {
  Users,
  Rols,
  Invitados,
  Salones,
  Eventos,
  MetodoDePago,
  Punto_de_venta,
  Tickets,
  Image,
  Orden,
  Pago,
  DetalleDeOrden,
  Entrada,
  Contrato,
  SubtipoEntrada
} = sequelize.models;

/* ------------------- Relaciones --------------------- */
// Usuario / Roles
Rols.hasMany(Users, { foreignKey: "roleId" });
Users.belongsTo(Rols, { foreignKey: "roleId" });

// Usuario / Punto de venta:
Users.belongsToMany(Punto_de_venta, {
  through: "UserPuntoVenta",
  foreignKey: "userId",
});
Punto_de_venta.belongsToMany(Users, {
  through: "UserPuntoVenta",
  foreignKey: "puntoId",
});

// Salones / Punto de venta
Salones.belongsToMany(Punto_de_venta, {
  through: "SalonPunto",
  foreignKey: "salonId",
});
Punto_de_venta.belongsToMany(Salones, {
  through: "SalonPunto",
  foreignKey: "puntoId",
});

// Eventos / Salones
Salones.belongsToMany(Eventos, {
  through: "SalonesEventos",
  foreignKey: "salonId",
});
Eventos.belongsToMany(Salones, {
  through: "SalonesEventos",
  foreignKey: "eventoId",
});
/*
// tipo de pago / punto de venta
Metodo_de_pago.belongsToMany(Punto_de_venta, {
  through: "metodosPago",
  foreignKey: "pagoId",
});
Punto_de_venta.belongsToMany(Metodo_de_pago, {
  through: "metodosPago",
  foreignKey: "puntoId",
});
*/
// Invitados / Users
Users.hasMany(Invitados, { foreignKey: "userId" });
Invitados.belongsTo(Users, { foreignKey: "userId" });

// Invitados / Eventos
Eventos.hasMany(Invitados, { foreignKey: "eventoId" });
Invitados.belongsTo(Eventos, { foreignKey: "eventoId" });

// Pago / Orden y Detalle / Metodo de pago / Entradas 
Pago.belongsTo(MetodoDePago, { foreignKey: "metodoDeCobroId" });
MetodoDePago.hasMany(Pago, { foreignKey: "metodoDeCobroId" });

Orden.hasMany(Pago, { foreignKey: "ordenId" });
Pago.belongsTo(Orden, { foreignKey: "ordenId" });

Users.hasMany(Orden, { foreignKey: { name: "userId", allowNull: true } });
Orden.belongsTo(Users, { foreignKey: { name: "userId", allowNull: true } });

Orden.hasMany(DetalleDeOrden, { foreignKey: "ordenId", onDelete:'CASCADE', onUpdate:'CASCADE' });
DetalleDeOrden.belongsTo(Orden, { foreignKey: "ordenId" });

Eventos.hasMany(Entrada, { foreignKey: "eventoId" });
Entrada.belongsTo(Eventos, { foreignKey: "eventoId" });
Entrada.hasMany(SubtipoEntrada, { foreignKey: 'EntradaId', as: 'subtipos', onDelete: 'CASCADE'});
SubtipoEntrada.belongsTo(Entrada, { foreignKey: 'EntradaId', as: 'entrada' });
Entrada.hasMany(DetalleDeOrden, { foreignKey: "entradaId" });
DetalleDeOrden.belongsTo(Entrada, { foreignKey: "entradaId" });

// Tickets / Orden / Eventos
Eventos.hasMany(Tickets, { foreignKey: "eventoId" });
Tickets.belongsTo(Eventos, { foreignKey: "eventoId" });
Orden.hasMany(Tickets, { foreignKey: "ordenId" });
Tickets.belongsTo(Orden, { foreignKey: "ordenId" });

// Images / Eventos
Eventos.hasMany(Image, {
  foreignKey: "relatedId",
  constraints: false,
  scope: {
    type: "evento",
  },
});

// Images / Salones
Salones.hasMany(Image, {
  foreignKey: "relatedId",
  constraints: false,
  scope: {
    type: "salon",
  },
});

// Images / Invitados
Invitados.hasMany(Image, {
  foreignKey: "relatedId",
  constraints: false,
  scope: {
    type: "invitado",
  },
});

// Images / Punto_de_venta
Punto_de_venta.hasMany(Image, {
  foreignKey: "relatedId",
  constraints: false,
  scope: {
    type: "punto_venta",
  },
});

// Images / Users
Users.hasMany(Image, {
  foreignKey: "relatedId",
  constraints: false,
  scope: {
    type: "usuario",
  },
});
//Eventos / Contrato
Eventos.hasOne(Contrato, {
  foreignKey: 'eventoId',
  as: 'contrato',
  onDelete: 'CASCADE',
});

Contrato.belongsTo(Eventos, {
  foreignKey: 'eventoId',
  as: 'evento',
  onDelete: 'CASCADE',
});

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./DataBase.js');
};
