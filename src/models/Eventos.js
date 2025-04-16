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
          min: 1, // Evita valores negativos o duración 0
        },
        comment: "Duración en minutos",
      },
      capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1, // Asegura que sea un número positivo
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    },
    { timestamps: true }
  );
};
