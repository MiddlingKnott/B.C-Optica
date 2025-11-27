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
    od_esf: DataTypes.STRING(20),
    od_cyl: DataTypes.STRING(20),
    od_eje: DataTypes.STRING(20),
    od_add: DataTypes.STRING(20),
    oi_esf: DataTypes.STRING(20),
    oi_cyl: DataTypes.STRING(20),
    oi_eje: DataTypes.STRING(20),
    oi_add: DataTypes.STRING(20)
}, {
    tableName: 'GraduacionAnterior',
    timestamps: false
});

module.exports = GraduacionAnterior;