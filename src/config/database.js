const { Sequelize } = require('sequelize');
const path = require('path');

// Definimos dónde se guardará el archivo de la base de datos
// __dirname apunta a 'src/config', así que subimos dos niveles para dejarla en la raíz
const storagePath = path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath, // Aquí se creará el archivo físico
    logging: false,       // (Opcional) Ponlo en true si quieres ver el SQL en la consola
    define: {
        timestamps: false // Mantenemos tu configuración global
    }
});

module.exports = sequelize;