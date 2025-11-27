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
    // --- AQUÍ ESTABA EL ERROR: USAR STRING EN LUGAR DE VARCHAR ---
    vl_od: DataTypes.STRING(10),
    vl_oi: DataTypes.STRING(10),
    vl_ao: DataTypes.STRING(10),
    vc_od: DataTypes.STRING(10),
    vc_oi: DataTypes.STRING(10),
    vc_ao: DataTypes.STRING(10)
}, {
    tableName: 'AgudezaVisual',
    timestamps: false
});

module.exports = AgudezaVisual;