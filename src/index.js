const express = require('express');
const path = require('path');
const sequelize = require('./config/database'); // Importar archivo de conexión de la bd

const app = express();
const PORT = 3000; // Puerto de la pagina

// Middlewares. Archivos estaticos de la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas de la API

// Iniciar todo
async function iniciarServidor() {
    try {
        // 1. Intenta conectarse a la base de datos
        await sequelize.authenticate();
        console.log('Conexión a MySQL (XAMPP) establecida.');

        // 2. Inicia el servidor web
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

// llamar a la funcion que inicia todo
iniciarServidor();