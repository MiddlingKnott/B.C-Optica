const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./clientes.model'); 

const Consulta = sequelize.define('Consulta', {
    id_consulta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cliente,
            key: 'id_cliente'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    observaciones_generales: {
        type: DataTypes.TEXT,
        defaultValue: ''
    }
}, {
    tableName: 'Consultas',
    timestamps: false
});

module.exports = Consulta;