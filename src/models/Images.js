// models/Image.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Image",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(
          "evento",
          "salon",
          "invitado",
          "punto_venta",
          "usuario",
          "otro"
        ),
        allowNull: false,
        defaultValue: "otro",
      },
      relatedId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "ID of the related entity (event, salon, etc.)",
      },
      isMain: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether this is the main image for the related entity",
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
    }
  );
};
