const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Consulta = require('./consulta.model');

const Sintomas = sequelize.define('Sintomas', {
    id_sintomas: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_consulta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: Consulta,
            key: 'id_consulta'
        }
    },
    vision_borrosa: {
        type: DataTypes.ENUM('Ninguno', 'Lejos', 'Cerca', 'Ambos'),
        defaultValue: 'Ninguno'
    },
    operaciones_oculares: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ojos_rojos: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    dolor_cabeza: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lagrimeo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Sintomas',
    timestamps: false
});

module.exports = Sintomas;