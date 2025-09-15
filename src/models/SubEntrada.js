const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define("SubtipoEntrada", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: UUIDV4,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            // Ejemplos: "Adulto", "Menor", "Senior", "Estudiante"
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        cantidad_disponible: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cantidad_vendida: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        cantidad_reservada: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        edad_minima: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        edad_maxima: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        requiere_documentacion: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        estatus: {
            type: DataTypes.ENUM('activo', 'inactivo', 'agotado'),
            allowNull: false,
            defaultValue: 'activo',
        },
    }, {
        timestamps: true,
        validate: {
            edadValida() {
                if (this.edad_minima && this.edad_maxima && this.edad_minima > this.edad_maxima) {
                    throw new Error('Edad mínima no puede ser mayor que máxima');
                }
            }
        }
    });
};