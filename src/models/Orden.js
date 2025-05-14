const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Orden",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pendiente", // valores posibles: 'pendiente', 'pagada', 'cancelada'
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      fecha_pago: {
        type: DataTypes.DATE,
        allowNull: true, // Se completará una vez el pago sea exitoso
      },
    },
    { timestamps: true }
  );
};