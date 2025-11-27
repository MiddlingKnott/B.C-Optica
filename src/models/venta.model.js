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
    modeloComprado: DataTypes.STRING(255),
    tipoMaterial: DataTypes.STRING(255),
    cantidadPagada: DataTypes.STRING(20) // Lo dejaste como VARCHAR en tu BD final
}, {
    tableName: 'Ventas',
    timestamps: false
});

module.exports = Venta;