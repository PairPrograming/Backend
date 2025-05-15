const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "DetalleDeOrden",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Cantidad de entradas de este tipo
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
          const cantidad = this.getDataValue('cantidad');
          const precio = this.getDataValue('precio_unitario');
          return cantidad * precio;
        }
      },
    },
    { timestamps: true }
  );
};