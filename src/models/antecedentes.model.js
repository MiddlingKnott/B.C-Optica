const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./clientes.model');

const Antecedentes = sequelize.define('AntecedentesPatologicos', {
    id_patologico: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Uno por cliente
        references: {
            model: Cliente,
            key: 'id_cliente'
        }
    },
    personales: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    no_personales: {
        type: DataTypes.TEXT,
        defaultValue: ''
    }
}, {
    tableName: 'AntecedentesPatologicos',
    timestamps: false
});

module.exports = Antecedentes;