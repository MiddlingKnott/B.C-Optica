const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
    // Definimos las columnas de la tabla Clientes
    id_cliente: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },
    
    edad: {
        type: DataTypes.INTEGER,
        allowNull: false 
    }

}, {
    // Opciones del modelo
    tableName: 'Clientes', // Nombre exacto de la tabla en MySQL
    timestamps: false     // No agregar createdAt/updatedAt
});

module.exports = Cliente;