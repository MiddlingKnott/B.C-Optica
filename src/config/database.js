const { Sequelize } = require('sequelize');

// Conexión a la BD (XAMPP)
const sequelize = new Sequelize('bcopticabd', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});

// Exportamos la conexión para que otros archivos la puedan usar
module.exports = sequelize;