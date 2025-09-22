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
        allowNull: true, // opcional
        unique: true,
      },
      dni: {
        type: DataTypes.STRING,
        allowNull: true, // opcional
        unique: true,
        // validate: { }
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false, // obligatorio
        // validate: { }
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: false, // obligatorio
        // validate: { }
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: true, // opcional
        // validate: { }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true, // ahora opcional
        unique: true,
        validate: {
          // isEmail: {
          //   msg: "Debe ser un email válido",
          // },
        },
      },
      whatsapp: {
        type: DataTypes.STRING,
        allowNull: true, // opcional
        // validate: { }
      },
      usuario: {
        type: DataTypes.STRING,
        allowNull: true, // opcional
        unique: true,
        // validate: { }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // opcional
        // validate: { }
      },
      rol: {
        type: DataTypes.ENUM("admin", "vendor", "comun", "graduado"),
        allowNull: true, // opcional también
        defaultValue: "comun",
        validate: {
          isIn: {
            args: [["admin", "vendor", "comun", "graduado"]],
            msg: "El rol debe ser 'admin', 'vendor', 'comun' o 'graduado'",
          },
        },
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true, // opcional
        validate: {
          // isUrl: {
          //   msg: "La URL de la imagen no es válida",
          // },
        },
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true, // opcional
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