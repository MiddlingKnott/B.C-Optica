const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    marca: {
        type: DataTypes.STRING(100)
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    categoria: {
        type: DataTypes.ENUM(
            'Armazon Linea', 
            'Armazon linea Bodega', 
            'Armazon promocion', 
            'Armazon promocion bodega', 
            'Articulos Auxiliares'
        ),
        allowNull: false
    }
}, {
    tableName: 'Productos',
    timestamps: false
});

module.exports = Producto;