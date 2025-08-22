const { DataTypes, UUIDV4 } = require("sequelize")

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
        type: DataTypes.JSONB,
        allowNull: true,
        comment:
          "JSON object with installment count as key and tax percentage as value. Example: {0: 0, 1: 10.3, 2: 20}",
      },
      comision: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    { timestamps: true },
  )
}
