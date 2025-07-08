const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Contrato", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    numeroContrato: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    fechaContrato: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    montoContrato: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    cantidadGraduados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    minimoCenas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    minimoBrindis: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    firmantes: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidFirmantes(value) {
          if (!Array.isArray(value)) {
            throw new Error('Firmantes debe ser un array');
          }
          if (value.length === 0) {
            throw new Error('Debe haber al menos un firmante');
          }
          value.forEach(firmante => {
            if (!firmante.nombre || !firmante.apellido || !firmante.telefono || !firmante.mail) {
              throw new Error('Cada firmante debe tener nombre, apellido, telefono y mail');
            }
          });
        },
      },
    },
    fechaFirma: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    vendedor: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaSenia: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pdf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'contratos',
    timestamps: true,
    indexes: [
      {
        fields: ['numeroContrato'],
      },
      {
        fields: ['fechaContrato'],
      },
      {
        fields: ['vendedor'],
      },
    ],
    hooks: {
      beforeValidate: (contrato) => {
        if (contrato.fechaFirma && contrato.fechaContrato) {
          if (new Date(contrato.fechaFirma) < new Date(contrato.fechaContrato)) {
            throw new Error('La fecha de firma no puede ser anterior a la fecha del contrato');
          }
        }
      },
    },
  });
};