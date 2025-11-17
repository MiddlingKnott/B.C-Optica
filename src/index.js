const express = require('express');
const path = require('path');
const sequelize = require('./config/database'); // Importar archivo de conexión de la bd

//  requires de las tablas de la bd
const Usuario = require('./models/usuario.model');
const Cliente = require('./models/clientes.model');

const app = express();
const PORT = 3000; // Puerto de la pagina

// Middlewares. Archivos estaticos y JSON de la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Inicio Rutas de la API 

// Ruta para iniciar sesion
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

// Ruta para guardar clientes
app.post('/api/clientes/agregar', async (req, res) => {
    try {
        // Obtenemos los datos que envió el JavaScript
        const { nombre, fecha_nacimiento, edad } = req.body;

        // Usamos el modelo para crear un nuevo registro en la BD
        const nuevoCliente = await Cliente.create({
            nombre: nombre,
            fecha_nacimiento: fecha_nacimiento,
            edad: edad
        });

        // Respondemos al JavaScript con éxito
        res.status(201).json({ success: true, cliente: nuevoCliente });

    } catch (error) {
        console.error('Error al agregar cliente:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// Ruta para obtener y visualizar Clientes
app.get('/api/clientes', async (req, res) => {
    try {
        // Obtenemos el término de búsqueda de la URL (ej: /api/clientes?nombre=...)
        const { nombre } = req.query;

        // Preparamos un objeto de filtro
        let filtro = {};

        // Si se proporcionó un nombre en la URL...
        if (nombre) {
            // ...configuramos el filtro para buscar ESE nombre exacto.
            // (MySQL es 'case-insensitive' por defecto, así que 'diego' encontrará 'Diego')
            filtro.nombre = nombre;
        }

        // 1. Usa el modelo Cliente para buscar todos los registros
        //    que coincidan con el filtro.
        //    - Si 'filtro' está vacío ({}), traerá a TODOS los clientes.
        //    - Si 'filtro' es {nombre: "Diego..."}, traerá SOLO a ese cliente.
        const clientes = await Cliente.findAll({ 
            where: filtro 
        });

        // 2. Envía la lista de clientes (completa o filtrada) como JSON
        res.json(clientes);

    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
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