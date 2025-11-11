const express = require('express');
const path = require('path');
const sequelize = require('./config/database'); // Importar archivo de conexión de la bd

//  requires de las tablas de la bd
const Usuario = require('./models/usuario.model');

const app = express();
const PORT = 3000; // Puerto de la pagina

// Middlewares. Archivos estaticos de la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));

// Inicio Rutas de la API 

app.post('/login', async (req, res) => {
    try {
        // 1. Obtenemos los datos del formulario
        const { usuario, password } = req.body;

        // 2. Buscamos al usuario en la base de datos
        const usuarioEncontrado = await Usuario.findOne({
            where: { nom_usuario: usuario }
        });

        // 3. Si no encontramos al usuario
        if (!usuarioEncontrado) {
            return res.send('Usuario o contraseña incorrectos. <a href="/">Volver</a>');
        }

        // 4. Comparamos el texto plano (¡INSEGURO!)
        const esCorrecta = (password === usuarioEncontrado.password_hash);

        // 5. Verificamos el resultado
        if (esCorrecta) {
            // ¡ÉXITO! Lo redirigimos a inicio.html
            res.redirect('/Inicio.html');
        } else {
            // ¡FALLO!
            res.send('Usuario o contraseña incorrectos. <a href="/">Volver</a>');
        }

    } catch (error) {
        console.error('Error en el login:', error);
        res.send('Ocurrió un error en el servidor.');
    }
});

// Fin Rutas de la API

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