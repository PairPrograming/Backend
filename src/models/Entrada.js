const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Entrada", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    tipo_entrada: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estatus: {
      type: DataTypes.STRING,
      allowNull: false,
            validate: {
        isIn: [["disponible", "agotada"]],
      },
    },
  }, {
    timestamps: true,
  });
};
