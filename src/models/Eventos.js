const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Eventos",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString(),
        },
      },
      duracion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
        comment: "Duración en minutos",
      },
      capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Changed default to true for better UX
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {
            msg: "La URL de la imagen no es válida",
          },
        },
      },
      salonId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment:
          "Nombre o identificador del salón donde se realizará el evento",
      },
      salonNombre: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Nombre del salón donde se realizará el evento",
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Descripción detallada del evento",
      },
    },
    {
      timestamps: true,
      indexes: [
        // Add index for common queries
        { fields: ["nombre"] },
        { fields: ["fecha"] },
        { fields: ["activo"] },
      ],
    }
  );
};
