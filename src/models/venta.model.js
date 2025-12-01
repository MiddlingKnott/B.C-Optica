const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Consulta = require('./consulta.model');

const Venta = sequelize.define('Venta', {
    id_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_consulta: {
        type: DataTypes.INTEGER,
        allowNull: true, // Puede ser nulo si es venta de mostrador
        references: {
            model: Consulta,
            key: 'id_consulta'
        }
    },
    modeloComprado: { type: DataTypes.STRING(255), defaultValue: '' },
    tipoMaterial: { type: DataTypes.STRING(255), defaultValue: '' },
    cantidadPagada: { type: DataTypes.DECIMAL(10, 2), defaultValue: '0.00' }, 
    cantidad_piezas: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'Ventas',
    timestamps: false
});

module.exports = Venta;