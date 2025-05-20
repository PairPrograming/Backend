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
      nombre_cliente: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_cliente: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true },
      },
      telefono_cliente: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dni_cliente: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [6, 20],
        },
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
    { timestamps: true,
      hooks: {
        beforeValidate: (orden) => {
          // Si hay userId, los campos de cliente son opcionales
          if (orden.userId) {
            return;
          }
          
          // Si no hay userId, los campos de cliente son obligatorios
          const requiredFields = ['nombre_cliente', 'email_cliente', 'telefono_cliente', 'dni_cliente'];
          for (const field of requiredFields) {
            if (!orden[field]) {
              throw new Error(`El campo ${field} es obligatorio cuando no hay un usuario registrado`);
            }
          }
        }
      }
    }
  );
};