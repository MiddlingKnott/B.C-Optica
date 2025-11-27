const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// --- Catálogo Tipos Graduación ---
const CatTipoGraduacion = sequelize.define('Cat_TiposGraduacion', {
    id_tipo_grad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true }
}, { tableName: 'Cat_TiposGraduacion', timestamps: false });

// --- Catálogo Tratamientos ---
const CatTratamiento = sequelize.define('Cat_Tratamientos', {
    id_tratamiento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true }
}, { tableName: 'Cat_Tratamientos', timestamps: false });

// --- Tablas Intermedias (Para guardar lo que selecciona el usuario) ---

const ConsultaTipoGrad = sequelize.define('Consulta_TiposGraduacion', {
    id_consulta: { type: DataTypes.INTEGER, primaryKey: true },
    id_tipo_grad: { type: DataTypes.INTEGER, primaryKey: true }
}, { tableName: 'Consulta_TiposGraduacion', timestamps: false });

const ConsultaTratamiento = sequelize.define('Consulta_Tratamientos', {
    id_consulta: { type: DataTypes.INTEGER, primaryKey: true },
    id_tratamiento: { type: DataTypes.INTEGER, primaryKey: true }
}, { tableName: 'Consulta_Tratamientos', timestamps: false });

module.exports = { 
    CatTipoGraduacion, 
    CatTratamiento, 
    ConsultaTipoGrad, 
    ConsultaTratamiento 
};