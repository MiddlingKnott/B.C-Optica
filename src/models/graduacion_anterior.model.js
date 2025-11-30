const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Consulta = require('./consulta.model');

const GraduacionAnterior = sequelize.define('GraduacionAnterior', {
    id_grad_refiere: {
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
    od_esf: { type: DataTypes.STRING(20), defaultValue: '0' },
    od_cyl: { type: DataTypes.STRING(20), defaultValue: '0' },
    od_eje: { type: DataTypes.STRING(20), defaultValue: '0' },
    od_add: { type: DataTypes.STRING(20), defaultValue: '0' },
    oi_esf: { type: DataTypes.STRING(20), defaultValue: '0' },
    oi_cyl: { type: DataTypes.STRING(20), defaultValue: '0' },
    oi_eje: { type: DataTypes.STRING(20), defaultValue: '0' },
    oi_add: { type: DataTypes.STRING(20), defaultValue: '0' }
}, {
    tableName: 'GraduacionAnterior',
    timestamps: false
});

module.exports = GraduacionAnterior;