const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('Eventos',{
        id: {
            type: DataTypes.UUID,
            primaryKey:true,
            defaultValue: UUIDV4
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull:false
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
                isAfter: new Date().toISOString()
            }
        },
        duracion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1 // Evita valores negativos o eventos de duración 0
            },
            comment: "Duración en minutos"
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue:false
        }
    }, { timestamps: true })
}