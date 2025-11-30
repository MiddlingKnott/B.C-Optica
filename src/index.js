const express = require('express');
const path = require('path');
const sequelize = require('./config/database'); // Importar archivo de conexión de la bd
const { Op } = require('sequelize');

//  requires de las tablas de la bd
const Usuario = require('./models/usuario.model');
const Cliente = require('./models/clientes.model');
const Consulta = require('./models/consulta.model');
const Antecedentes = require('./models/antecedentes.model');
const Sintomas = require('./models/sintomas.model');
const AgudezaVisual = require('./models/agudeza.model');
const GraduacionAnterior = require('./models/graduacion_anterior.model');
const GraduacionActual = require('./models/graduacion_actual.model');
const Producto = require('./models/producto.model');
const Venta = require('./models/venta.model');
const {
    CatTipoGraduacion,
    CatTratamiento,
    ConsultaTipoGrad,
    ConsultaTratamiento
} = require('./models/catalogos.model');

// --- Relación: Cliente <-> Antecedentes (1 a 1) ---
Cliente.hasOne(Antecedentes, { foreignKey: 'id_cliente' });
Antecedentes.belongsTo(Cliente, { foreignKey: 'id_cliente' });

// --- Relación: Cliente <-> Consultas (1 a N) ---
Cliente.hasMany(Consulta, { foreignKey: 'id_cliente' });
Consulta.belongsTo(Cliente, { foreignKey: 'id_cliente' });

// --- Relación: Consulta <-> Datos Clínicos (1 a 1) ---
// Cada consulta tiene UN registro de cada tabla clínica
Consulta.hasOne(Sintomas, { foreignKey: 'id_consulta' });
Sintomas.belongsTo(Consulta, { foreignKey: 'id_consulta' });

Consulta.hasMany(AgudezaVisual, { foreignKey: 'id_consulta' });
AgudezaVisual.belongsTo(Consulta, { foreignKey: 'id_consulta' });

Consulta.hasOne(GraduacionAnterior, { foreignKey: 'id_consulta' });
GraduacionAnterior.belongsTo(Consulta, { foreignKey: 'id_consulta' });

Consulta.hasOne(GraduacionActual, { foreignKey: 'id_consulta' });
GraduacionActual.belongsTo(Consulta, { foreignKey: 'id_consulta' });

// --- Relación: Consulta <-> Ventas (1 a N) ---
Consulta.hasMany(Venta, { foreignKey: 'id_consulta' });
Venta.belongsTo(Consulta, { foreignKey: 'id_consulta' });

// 1. Consulta <-> Tipos de Graduación (Mediante tabla intermedia)
Consulta.belongsToMany(CatTipoGraduacion, {
    through: ConsultaTipoGrad,
    foreignKey: 'id_consulta'
});
CatTipoGraduacion.belongsToMany(Consulta, {
    through: ConsultaTipoGrad,
    foreignKey: 'id_tipo_grad'
});

// 2. Consulta <-> Tratamientos (Mediante tabla intermedia)
Consulta.belongsToMany(CatTratamiento, {
    through: ConsultaTratamiento,
    foreignKey: 'id_consulta'
});
CatTratamiento.belongsToMany(Consulta, {
    through: ConsultaTratamiento,
    foreignKey: 'id_tratamiento'
});

const app = express();
const PORT = 3000; // Puerto de la pagina

// Middlewares. Archivos estaticos y JSON de la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Inicio Rutas de la API 

// --- RUTA A PRUEBA DE FALLOS ---
// Pégala arriba, justo debajo de 'app.use(express.json())'
app.get('/api/consultas/por-fecha', async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        // Validación simple
        if (!inicio || !fin) {
            alert("Ingresa ambas fechas")
            return res.status(400).json([]);
        }

        const consultas = await Consulta.findAll({
            where: {
                fecha: { [Op.between]: [inicio, fin] }
            },
            include: [{ model: Cliente }],
            order: [['fecha', 'DESC']]
        });

        res.json(consultas);

    } catch (error) {
        console.error(" Error interno:", error);
        res.status(500).json({ message: error.message });
    }
});

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
        const { nombre, apellido, fecha_nacimiento } = req.body;

        console.log('Datos recibidos:', { nombre, apellido, fecha_nacimiento });

        // Usamos el modelo para crear un nuevo registro en la BD
        const nuevoCliente = await Cliente.create({
            nombre: nombre,
            apellido: apellido,
            fecha_nacimiento: fecha_nacimiento,
        });

        console.log('Cliente creado:', nuevoCliente);

        // Recargamos el cliente para obtener todos sus atributos (incluyendo apellido)
        const clienteConAtributos = await Cliente.findByPk(nuevoCliente.id_cliente, {
            attributes: ['id_cliente', 'nombre', 'apellido', 'fecha_nacimiento', 'edad']
        });

        console.log('Cliente con atributos:', clienteConAtributos);

        // Respondemos al JavaScript con éxito
        res.status(201).json({ success: true, cliente: clienteConAtributos });

    } catch (error) {
        console.error('Error al agregar cliente:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// Ruta para obtener y visualizar Clientes
app.get('/api/clientes', async (req, res) => {
    try {
        // Obtenemos el término de búsqueda de la URL (ej: /api/clientes?nombre=...)

        const { nombre, apellido } = req.query;

        // Preparamos un objeto de filtro
        let filtro = {};

        // Si se proporcionó un nombre en la URL, usamos LIKE para coincidencias parciales
        if (nombre) {
            filtro.nombre = { [Op.like]: `%${nombre}%` };
        }

        // Si se proporcionó un apellido en la URL, usamos LIKE también
        if (apellido) {
            filtro.apellido = { [Op.like]: `%${apellido}%` };
        }

        // Buscamos en la BD usando el filtro (vacío = todos)
        const clientes = await Cliente.findAll({
            where: filtro,
            order: [['nombre', 'ASC'], ['apellido', 'ASC']]
        });

        // 2. Envía la lista de clientes (completa o filtrada) como JSON
        res.json(clientes);

    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// --- RUTA PARA AGREGAR PRODUCTO ---
app.post('/api/productos/agregar', async (req, res) => {
    try {
        const { marca, piezas, categoria } = req.body;

        const nuevoProducto = await Producto.create({
            marca: marca,
            stock: piezas,
            categoria: categoria
        });

        res.status(201).json({ success: true, producto: nuevoProducto });

    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ success: false, message: 'Error al guardar en base de datos.' });
    }
});

// RUTA PARA OBTENER PRODUCTOS  CON FILTRO ENUM
app.get('/api/productos', async (req, res) => {
    try {

        const { categoria, search } = req.query;
        let filtro = {};

        // Si nos envían una categoría, filtramos por ella
        if (categoria) {
            filtro.categoria = categoria;
        }
        if (search) {
            filtro.marca = {
                [Op.like]: `%${search}%`
            };
        }
        // Buscamos en la BD
        const productos = await Producto.findAll({
            where: filtro,
            order: [['categoria', 'ASC'], ['marca', 'ASC']]
        });

        res.json(productos);

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// --- RUTA PARA ACTUALIZAR (EDITAR) UN PRODUCTO ---
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID de la URL
        const { marca, stock } = req.body; // Obtenemos los datos nuevos

        // Sequelize: Actualizar donde el ID coincida
        await Producto.update(
            { marca: marca, stock: stock },
            { where: { id_producto: id } }
        );

        res.json({ success: true, message: 'Producto actualizado' });

    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ success: false });
    }
});

// --- RUTA PARA ELIMINAR UN PRODUCTO ---
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Sequelize: Borrar donde el ID coincida
        await Producto.destroy({
            where: { id_producto: id }
        });

        res.json({ success: true, message: 'Producto eliminado' });

    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ success: false });
    }
});

// --- RUTA MAESTRA: AGREGAR CONSULTA CLÍNICA COMPLETA ---
app.post('/api/consultas/agregar', async (req, res) => {
    try {
        // 'd' contiene todo el objeto JSON que envió el frontend
        const d = req.body;

        console.log("Recibiendo datos de consulta para Cliente ID:", d.id_cliente);

        // ====================================================
        // PASO 1: Crear la CONSULTA (El registro padre)
        // ====================================================
        const nuevaConsulta = await Consulta.create({
            id_cliente: d.id_cliente,
            fecha: d.fecha_consulta || new Date(), // Guarda la fecha y hora actual automáticamente
            observaciones_generales: d.observaciones_generales
        });

        // Guardamos el ID de la consulta recién creada. 
        // ¡Lo necesitaremos para vincular todo lo demás!
        const idC = nuevaConsulta.id_consulta;


        // ====================================================
        // PASO 2: Guardar ANTECEDENTES (Vinculados al Cliente)
        // ====================================================
        // Nota: Como la relación es 1 a 1 con el Cliente, primero revisamos 
        // si ya existen para actualizarlos, o si no, los creamos.

        const antecedentesExistentes = await Antecedentes.findOne({
            where: { id_cliente: d.id_cliente }
        });

        if (antecedentesExistentes) {
            // Si ya existen, los actualizamos con la nueva información
            await antecedentesExistentes.update({
                personales: d.antecedentes.personales,
                no_personales: d.antecedentes.no_personales
            });
        } else {
            // Si no existen, los creamos
            await Antecedentes.create({
                id_cliente: d.id_cliente,
                personales: d.antecedentes.personales,
                no_personales: d.antecedentes.no_personales
            });
        }


        // ====================================================
        // PASO 3: Guardar SÍNTOMAS (Vinculados a la Consulta)
        // ====================================================
        await Sintomas.create({
            id_consulta: idC,
            vision_borrosa: d.sintomas.vision_borrosa,      // 'lejos', 'cerca', 'ambos', 'ninguno'
            operaciones_oculares: d.sintomas.operaciones,   // true/false
            ojos_rojos: d.sintomas.ojos_rojos,              // true/false
            dolor_cabeza: d.sintomas.dolor_cabeza,          // true/false
            lagrimeo: d.sintomas.lagrimeo                   // true/false
        });


        // ====================================================
        // PASO 4: Guardar AGUDEZA VISUAL (2 Registros)
        // ====================================================

        // 4.1 Registro "Sin Corrección"
        await AgudezaVisual.create({
            id_consulta: idC,
            tipo: 'SinCorreccion',
            vl_od: d.agudeza_sin.vl_od,
            vl_oi: d.agudeza_sin.vl_oi,
            vl_ao: d.agudeza_sin.vl_ao,
            vc_od: d.agudeza_sin.vc_od,
            vc_oi: d.agudeza_sin.vc_oi,
            vc_ao: d.agudeza_sin.vc_ao
        });

        // 4.2 Registro "Con Lentes"
        await AgudezaVisual.create({
            id_consulta: idC,
            tipo: 'ConLentes',
            vl_od: d.agudeza_con.vl_od,
            vl_oi: d.agudeza_con.vl_oi,
            vl_ao: d.agudeza_con.vl_ao,
            vc_od: d.agudeza_con.vc_od,
            vc_oi: d.agudeza_con.vc_oi,
            vc_ao: d.agudeza_con.vc_ao
        });


        // ====================================================
        // PASO 5: Guardar GRADUACIONES
        // ====================================================

        // 5.1 Graduación Anterior (La que trae el paciente)
        // Solo la guardamos si al menos un campo tiene datos para evitar registros vacíos
        // (Opcional: puedes quitar el 'if' si siempre quieres guardar el registro aunque esté vacío)
        await GraduacionAnterior.create({
            id_consulta: idC,
            od_esf: d.grad_anterior.od_esf,
            od_cyl: d.grad_anterior.od_cyl,
            od_eje: d.grad_anterior.od_eje,
            od_add: d.grad_anterior.od_add,
            oi_esf: d.grad_anterior.oi_esf,
            oi_cyl: d.grad_anterior.oi_cyl,
            oi_eje: d.grad_anterior.oi_eje,
            oi_add: d.grad_anterior.oi_add
        });

        // 5.2 Graduación Actual (La receta nueva)
        await GraduacionActual.create({
            id_consulta: idC,
            od_esf: d.grad_actual.od_esf,
            od_cyl: d.grad_actual.od_cyl,
            od_eje: d.grad_actual.od_eje,
            od_add: d.grad_actual.od_add,
            oi_esf: d.grad_actual.oi_esf,
            oi_cyl: d.grad_actual.oi_cyl,
            oi_eje: d.grad_actual.oi_eje,
            oi_add: d.grad_actual.oi_add,
            dip: d.grad_actual.dip
        });


        // ====================================================
        // PASO 6: Guardar VENTA (Si aplica)
        // ====================================================
        // Verificamos si hay productos en el carrito (el array que viene del JS)
        if (d.productos_venta && d.productos_venta.length > 0) {

            // Recorremos cada producto del carrito
            for (const item of d.productos_venta) {

                // A. BUSCAR Y DESCONTAR STOCK (Solo si tenemos ID de producto)
                if (item.id_producto) {
                    const productoEncontrado = await Producto.findByPk(item.id_producto);
                    if (productoEncontrado) {
                        const nuevaCantidad = productoEncontrado.stock - item.cantidad;

                        // Actualizamos el stock
                        await productoEncontrado.update({ stock: nuevaCantidad });
                    }
                }

                // B. CREAR REGISTRO EN TABLA VENTAS (Se creará una fila por cada producto)
                await Venta.create({
                    id_consulta: idC,
                    id_cliente: d.id_cliente,
                    modeloComprado: item.nombre,
                    tipoMaterial: item.material,
                    cantidadPagada: d.venta.cantidad,
                });
            }
        }

        if (d.lentes_seleccionados && d.lentes_seleccionados.length > 0) {
            // Buscamos los IDs en el catálogo basados en los nombres que envió el frontend
            const lentesEncontrados = await CatTipoGraduacion.findAll({
                where: {
                    nombre: { [Op.in]: d.lentes_seleccionados } // Busca todos los que coincidan
                }
            });

            // Usamos el método mágico de Sequelize para crear las relaciones
            // (addCat_TiposGraduacions o addCat_TiposGraduacion dependiendo de tu definición, 
            //  si definiste belongsToMany, Sequelize crea métodos 'add...').
            // Una forma más segura manual es:
            for (const lente of lentesEncontrados) {
                await ConsultaTipoGrad.create({
                    id_consulta: idC,
                    id_tipo_grad: lente.id_tipo_grad
                });
            }
        }

        // 3. Guardar Tratamientos
        if (d.tratamientos_seleccionados && d.tratamientos_seleccionados.length > 0) {
            const tratamientosEncontrados = await CatTratamiento.findAll({
                where: {
                    nombre: { [Op.in]: d.tratamientos_seleccionados }
                }
            });

            for (const trat of tratamientosEncontrados) {
                await ConsultaTratamiento.create({
                    id_consulta: idC,
                    id_tratamiento: trat.id_tratamiento
                });
            }
        }

        // ====================================================
        // PASO FINAL: Responder al Frontend
        // ====================================================
        res.status(201).json({
            success: true,
            message: 'Consulta, historial y venta guardados exitosamente.',
            id_consulta: idC
        });

    } catch (error) {
        console.error('Error CRÍTICO al guardar consulta:', error);

        // Enviamos el mensaje de error exacto para saber qué falló
        res.status(500).json({
            success: false,
            message: 'Error en el servidor: ' + error.message
        });
    }
});

app.get('/api/historial/buscar', async (req, res) => {
    try {
        const { nombre } = req.query;

        // Si no hay nombre, devolvemos lista vacía
        if (!nombre) return res.json([]);

        // Buscamos al cliente y traemos TODA su información relacionada
        const clientes = await Cliente.findAll({
            where: {
                // Busca coincidencias parciales (ej: "Trav" encuentra "Travis")
                nombre: { [Op.like]: `%${nombre}%` }
            },
            include: [
                // 1. Datos fijos del cliente
                { model: Antecedentes },

                // 2. Todas sus consultas y el detalle de cada una
                {
                    model: Consulta,
                    include: [
                        Sintomas,
                        AgudezaVisual,     // Nota: Sequelize lo pluraliza a veces
                        GraduacionAnterior,
                        GraduacionActual,
                        Venta,
                        { model: CatTipoGraduacion }, // Lentes seleccionados
                        { model: CatTratamiento }     // Tratamientos seleccionados
                    ]
                }
            ]
        });

        res.json(clientes);

    } catch (error) {
        console.error('Error al buscar historial:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});


// ====================================================
// RUTA 1: OBTENER UNA CONSULTA ESPECÍFICA (Para Editar)
// ====================================================
app.get('/api/consultas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Buscamos la consulta y traemos ABSOLUTAMENTE TODO lo relacionado
        // para poder rellenar el formulario completo.
        const consulta = await Consulta.findOne({
            where: { id_consulta: id },
            include: [
                // 1. Tablas directas de la consulta
                Sintomas,
                AgudezaVisual,
                GraduacionAnterior,
                GraduacionActual,
                Venta,

                // 2. Catálogos (Muchos a Muchos)
                { model: CatTipoGraduacion },
                { model: CatTratamiento },

                // 3. Datos del Cliente y sus Antecedentes (para mostrarlos también)
                {
                    model: Cliente,
                    include: [Antecedentes]
                }
            ]
        });

        if (!consulta) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }

        res.json(consulta);

    } catch (error) {
        console.error('Error al obtener consulta:', error);
        res.status(500).json({ message: 'Error en el servidor al cargar datos.' });
    }
});


// ====================================================
// RUTA 2: ACTUALIZAR (EDITAR) UNA CONSULTA COMPLETA
// ====================================================
app.put('/api/consultas/:id', async (req, res) => {
    try {
        const idC = req.params.id; // ID de la Consulta
        const d = req.body;        // Datos nuevos del formulario

        console.log(`Actualizando consulta ID: ${idC}`);

        // --- 1. Actualizar Datos Básicos de la Consulta ---
        await Consulta.update(
            { observaciones_generales: d.observaciones_generales },
            { where: { id_consulta: idC } }
        );

        // --- 2. Actualizar Antecedentes (Pertenecen al Cliente) ---
        // Como los antecedentes son únicos por cliente, los actualizamos directamente
        if (d.id_cliente) {
            await Antecedentes.update(
                {
                    personales: d.antecedentes.personales,
                    no_personales: d.antecedentes.no_personales
                },
                { where: { id_cliente: d.id_cliente } }
            );
        }

        // --- 3. Actualizar Síntomas ---
        // Estrategia: Borrar el registro viejo y crear uno nuevo (es más limpio que hacer update campo por campo)
        await Sintomas.destroy({ where: { id_consulta: idC } });

        await Sintomas.create({
            id_consulta: idC,
            vision_borrosa: d.sintomas.vision_borrosa,
            operaciones_oculares: d.sintomas.operaciones,
            ojos_rojos: d.sintomas.ojos_rojos,
            dolor_cabeza: d.sintomas.dolor_cabeza,
            lagrimeo: d.sintomas.lagrimeo
        });

        // --- 4. Actualizar Agudeza Visual ---
        // Borramos los 2 registros anteriores (Sin y Con lentes) y creamos los nuevos
        await AgudezaVisual.destroy({ where: { id_consulta: idC } });

        await AgudezaVisual.create({
            id_consulta: idC,
            tipo: 'SinCorreccion',
            vl_od: d.agudeza_sin.vl_od, vl_oi: d.agudeza_sin.vl_oi, vl_ao: d.agudeza_sin.vl_ao,
            vc_od: d.agudeza_sin.vc_od, vc_oi: d.agudeza_sin.vc_oi, vc_ao: d.agudeza_sin.vc_ao
        });

        await AgudezaVisual.create({
            id_consulta: idC,
            tipo: 'ConLentes',
            vl_od: d.agudeza_con.vl_od, vl_oi: d.agudeza_con.vl_oi, vl_ao: d.agudeza_con.vl_ao,
            vc_od: d.agudeza_con.vc_od, vc_oi: d.agudeza_con.vc_oi, vc_ao: d.agudeza_con.vc_ao
        });

        // --- 5. Actualizar Graduaciones ---
        await GraduacionAnterior.destroy({ where: { id_consulta: idC } });
        await GraduacionAnterior.create({
            id_consulta: idC,
            od_esf: d.grad_anterior.od_esf, od_cyl: d.grad_anterior.od_cyl, od_eje: d.grad_anterior.od_eje, od_add: d.grad_anterior.od_add,
            oi_esf: d.grad_anterior.oi_esf, oi_cyl: d.grad_anterior.oi_cyl, oi_eje: d.grad_anterior.oi_eje, oi_add: d.grad_anterior.oi_add
        });

        await GraduacionActual.destroy({ where: { id_consulta: idC } });
        await GraduacionActual.create({
            id_consulta: idC,
            od_esf: d.grad_actual.od_esf, od_cyl: d.grad_actual.od_cyl, od_eje: d.grad_actual.od_eje, od_add: d.grad_actual.od_add,
            oi_esf: d.grad_actual.oi_esf, oi_cyl: d.grad_actual.oi_cyl, oi_eje: d.grad_actual.oi_eje, oi_add: d.grad_actual.oi_add,
            dip: d.grad_actual.dip
        });

        // --- 6. Actualizar Venta ---
        // --- 6. Actualizar Venta (CON LOGICA DE STOCK) ---

        // A. RECUPERAR STOCK ANTES DE BORRAR
        const ventasAnteriores = await Venta.findAll({ where: { id_consulta: idC } });

        for (const ventaVieja of ventasAnteriores) {
            const productoOriginal = await Producto.findOne({
                where: { marca: ventaVieja.modeloComprado }
            });

            if (productoOriginal) {
                // --- CORRECCIÓN AQUÍ: USAR parseInt() ---

                // 1. Aseguramos que el stock actual sea un número
                const stockActual = parseInt(productoOriginal.stock);

                // 2. Aseguramos que la cantidad a devolver sea un número
                // (Si cantidadPagada es nulo, usamos 0)
                const cantidadADevolver = parseInt(ventaVieja.cantidadPagada) || 0;

                // 3. Hacemos la suma matemática
                const stockRestaurado = stockActual + cantidadADevolver;

                await productoOriginal.update({ stock: stockRestaurado });
                console.log(`Stock restaurado: ${stockActual} + ${cantidadADevolver} = ${stockRestaurado}`);
            }
        }

        // B. AHORA SÍ, BORRAMOS EL REGISTRO VIEJO DE VENTA
        await Venta.destroy({ where: { id_consulta: idC } });

        // C. PROCESAMOS LA NUEVA LISTA (EL CARRITO NUEVO)
        if (d.productos_venta && d.productos_venta.length > 0) {
            for (const item of d.productos_venta) {

                // Descontamos stock (NUEVO DESCUENTO)
                if (item.id_producto) {
                    const prod = await Producto.findByPk(item.id_producto);
                    if (prod) {
                        const nuevoStock = prod.stock - item.cantidad;
                        await prod.update({ stock: nuevoStock });
                    }
                }

                // Creamos el nuevo registro de venta
                await Venta.create({
                    id_consulta: idC,
                    id_cliente: d.id_cliente,
                    modeloComprado: item.nombre,
                    tipoMaterial: item.material,
                    cantidadPagada: item.cantidad
                });
            }
        }

        // A. Limpiamos relaciones viejas
        await ConsultaTipoGrad.destroy({ where: { id_consulta: idC } });
        await ConsultaTratamiento.destroy({ where: { id_consulta: idC } });

        // B. Insertamos las nuevas (si hay)
        if (d.lentes_seleccionados && d.lentes_seleccionados.length > 0) {
            const lentes = await CatTipoGraduacion.findAll({ where: { nombre: { [Op.in]: d.lentes_seleccionados } } });
            for (const lente of lentes) {
                await ConsultaTipoGrad.create({ id_consulta: idC, id_tipo_grad: lente.id_tipo_grad });
            }
        }

        if (d.tratamientos_seleccionados && d.tratamientos_seleccionados.length > 0) {
            const tratam = await CatTratamiento.findAll({ where: { nombre: { [Op.in]: d.tratamientos_seleccionados } } });
            for (const trat of tratam) {
                await ConsultaTratamiento.create({ id_consulta: idC, id_tratamiento: trat.id_tratamiento });
            }
        }

        // --- FIN ---
        res.json({ success: true, message: 'Consulta actualizada correctamente' });

    } catch (error) {
        console.error('Error al actualizar consulta:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al actualizar.' });
    }
});

// --- RUTA: OBTENER SOLO ANTECEDENTES DE UN CLIENTE ---
app.get('/api/clientes/:id/antecedentes', async (req, res) => {
    try {
        const ant = await Antecedentes.findOne({ where: { id_cliente: req.params.id } });
        res.json(ant || {}); // Devuelve objeto vacío si no hay
    } catch (error) {
        res.status(500).json({});
    }
});

// --- RUTA: OBTENER PRODUCTOS CON STOCK BAJO ---
app.get('/api/avisos/stock-bajo', async (req, res) => {
    try {
        // Buscamos productos con stock menor o igual a 3
        const productosBajos = await Producto.findAll({
            where: {
                stock: {
                    [Op.lte]: 3 // lte = Menor o igual a
                }
            },
            order: [['stock', 'ASC']] // Los de menor stock primero (urgentes)
        });

        res.json(productosBajos);

    } catch (error) {
        console.error('Error al obtener avisos:', error);
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

        // 2. Sincronizar modelos con la BD (alter: true = agregar columnas si faltan)
        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados con la base de datos.');

        // 3. Inicia el servidor web
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

// llamar a la funcion que inicia todo
iniciarServidor();