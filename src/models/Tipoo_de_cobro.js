const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "MetodoDePago",
    {
      Id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: UUIDV4,
      },
      tipo_de_cobro: {
       type: DataTypes.STRING(100),
        allowNull: false,
      
      },
      impuesto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      comision: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    { timestamps: true }
  );
};
