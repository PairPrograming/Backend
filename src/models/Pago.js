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
    comision: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    impuestos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    referencia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_cancelacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se canceló el pago'
    },  
    motivo_cancelacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo por el cual se canceló el pago'
    },
    error_message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });
};
