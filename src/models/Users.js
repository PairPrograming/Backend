const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
  sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      auth0Id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      dni: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          conditionalRequired(value) {
            if (!this.auth0Id && (!value || value.trim() === "")) {
              throw new Error("DNI es obligatorio si no se usa Auth0");
            }
          },
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (!this.auth0Id && (!value || value.trim() === "")) {
              throw new Error("Nombre es obligatorio si no se usa Auth0");
            }
          },
        },
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (!this.auth0Id && (!value || value.trim() === "")) {
              throw new Error("Apellido es obligatorio si no se usa Auth0");
            }
          },
        },
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (!this.auth0Id && (!value || value.trim() === "")) {
              throw new Error("Dirección es obligatoria si no se usa Auth0");
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Debe ser un email válido",
          },
        },
      },
      whatsapp: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (!this.auth0Id && (!value || value.trim() === "")) {
              throw new Error("Whatsapp es obligatorio si no se usa Auth0");
            }
          },
        },
      },
      usuario: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          conditionalRequired(value) {
            if (!this.auth0Id && (!value || value.trim() === "")) {
              throw new Error("Usuario es obligatorio si no se usa Auth0");
            }
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notNullIfNoAuth0(value) {
            if (!this.auth0Id && !value) {
              throw new Error("Debe establecer una contraseña o usar Auth0");
            }
          },
        },
      },
      rol: {
        type: DataTypes.ENUM("admin", "vendor", "comun", "graduado"),
        allowNull: false,
        defaultValue: "comun", // Por defecto será 'vendor'
        validate: {
          isIn: {
            args: [["admin", "vendor", "comun", "graduado"]],
            msg: "El rol debe ser 'admin' o 'vendor'",
          },
        },
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {
            msg: "La URL de la imagen no es válida",
          },
        },
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password") && user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
    }
  );
};
