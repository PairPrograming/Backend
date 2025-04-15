const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('Salones',{
        Id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: UUIDV4
        },
        salon:{
            type: DataTypes.STRING,
            unique: true,
            allowNull:false
        },
        nombre:{
            type: DataTypes.STRING,
            allowNull:false
        },  
        capacidad: {
            type: DataTypes.INTEGER,
            allowNull:false,
            defaultValue: 1,
            validate: {
                min: 1 // Asegura que sea un número positivo
            }
        },
        cuit:{
            type: DataTypes.STRING,
            allowNull:false,
            unique: true,
            validate: {
                is: /^\d{2}-\d{8}-\d{1}$/  // Valida formato CUIT argentino
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        whatsapp: {
            type: DataTypes.STRING,
            allowNull: false, 
          },
        estatus: {
            type: DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue: true
        },
        Mercadopago: {
            type: DataTypes.STRING,
            allowNull:false
        }
    }, { timestamps: true })
}