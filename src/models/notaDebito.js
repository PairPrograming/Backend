const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('NotaDebito', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: UUIDV4
        },
        numeroNota: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
        },
        tipoNota: {
            type: DataTypes.ENUM('CAMBIO', 'AJUSTE', 'SERVICIO_ADICIONAL', 'OTRO'),
            allowNull: false,
            defaultValue: 'CAMBIO',
        },
        concepto: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        ValorNeto: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: 0
            },
        },
        cuotas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        valorImpuesto: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: 0
            },
        },
        comision: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        },
        valorTotal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: 0
            },
        },
        fechaEmision: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        detalle: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    }, { timestamps: false });
};