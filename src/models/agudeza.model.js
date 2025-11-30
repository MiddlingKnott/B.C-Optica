const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Consulta = require('./consulta.model');

const AgudezaVisual = sequelize.define('AgudezaVisual', {
    id_av: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_consulta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Consulta,
            key: 'id_consulta'
        }
    },
    tipo: {
        type: DataTypes.ENUM('SinCorreccion', 'ConLentes'),
        allowNull: false
    },

    vl_od: {
        type: DataTypes.STRING(10),
        defaultValue: '' 
    },
    vl_oi: {
        type: DataTypes.STRING(10),
        defaultValue: ''
    },
    vl_ao: {
        type: DataTypes.STRING(10),
        defaultValue: ''
    },
    vc_od: {
        type: DataTypes.STRING(10),
        defaultValue: ''
    },
    vc_oi: {
        type: DataTypes.STRING(10),
        defaultValue: ''
    },
    vc_ao: {
        type: DataTypes.STRING(10),
        defaultValue: ''
    }
}, {
    tableName: 'AgudezaVisual',
    timestamps: false
});

module.exports = AgudezaVisual;