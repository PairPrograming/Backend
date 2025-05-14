const { DataTypes, UUIDV4 } = require("sequelize");
module.exports = (sequelize) => {
     sequelize.define("Pago", {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING, // ejemplo: 'completed', 'failed'
        allowNull: false,
      },
    }, {
      timestamps: true,
    });
  };
  