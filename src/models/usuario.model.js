const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 'Usuario' es el nombre que usaremos en Node.js
const Usuario = sequelize.define('Usuario', {
    
    // definir cada columna de la tabla MySQL

    id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nom_usuario: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255), 
        allowNull: false
    }
}, {
       
    tableName: 'Usuarios', 
    timestamps: false 
});

// Exportamos el modelo para que 'index.js' pueda usarlo
module.exports = Usuario;