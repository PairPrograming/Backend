const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Entrada",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      tipo_entrada: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      cantidad_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad_real: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      fecha_inicio_venta: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_fin_venta: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estatus: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["disponible", "agotado", "suspendido", "inactivo"]],
        },
      },
    },
    {
      timestamps: true,
    }
  );
};
