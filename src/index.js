const express = require('express');
const path = require('path');
const sequelize = require('./config/database'); // Importar archivo de conexión de la bd
const { Op, Sequelize } = require('sequelize');

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

async function sembrarDatosIniciales() {
    try {
        // 1. USUARIO ADMINISTRADOR
        // Busca si existe 'Adminbc'. Si no, lo crea.
        await Usuario.findOrCreate({
            where: { nom_usuario: 'Adminbc' },
            defaults: {
                password_hash: 'opticabc925' // Aquí iría el hash si usaras bcrypt
            }
        });

        // 2. CATÁLOGO: TIPOS DE GRADUACIÓN
        const tiposGraduacion = ['Monofocal', 'Bifocal', 'L28', 'Inv', 'Progresivo'];

        for (const tipo of tiposGraduacion) {
            await CatTipoGraduacion.findOrCreate({
                where: { nombre: tipo }
            });
        }

        // 3. CATÁLOGO: TRATAMIENTOS
        const tratamientos = ['AR', 'FotoAR', 'BlueProtect', 'FotoBlue', 'Policarbonato'];

        for (const trat of tratamientos) {
            await CatTratamiento.findOrCreate({
                where: { nombre: trat }
            });
        }

    } catch (error) {
        console.error('⚠️ Error al sembrar datos:', error);
    }
}

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
        const { nombre } = req.query; // El texto del buscador
        let filtro = {};

        if (nombre) {
            // LÓGICA IDÉNTICA A HISTORIAL:
            // "Concatena nombre + espacio + apellido y busca coincidencias"
            filtro = Sequelize.where(
                Sequelize.fn('concat', Sequelize.col('nombre'), ' ', Sequelize.col('apellido')),
                {
                    [Op.like]: `%${nombre}%`
                }
            );
        }

        const clientes = await Cliente.findAll({
            where: filtro,
            // Ordenamos del más nuevo al más antiguo
            order: [['id_cliente', 'DESC']]
        });

        res.json(clientes);

    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
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
                    modeloComprado: item.nombre,
                    tipoMaterial: item.material,
                    cantidadPagada: d.venta.cantidad,
                    cantidad_piezas: item.cantidad
                });
            }
        }

        const { CatTipoGraduacion, CatTratamiento, ConsultaTipoGrad, ConsultaTratamiento } = require('./models/catalogos.model');

        // A. Lentes (Convertimos todo a minúsculas para comparar)
        if (d.lentes_seleccionados && d.lentes_seleccionados.length > 0) {
            // Convertimos lo que llega del frontend a minúsculas
            const lentesInput = d.lentes_seleccionados.map(l => l.toLowerCase());

            const lentesEncontrados = await CatTipoGraduacion.findAll({
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('nombre')),
                    { [Op.in]: lentesInput }
                )
            });

            for (const lente of lentesEncontrados) {
                await ConsultaTipoGrad.create({ id_consulta: idC, id_tipo_grad: lente.id_tipo_grad });
            }
        }

        // B. Tratamientos (Misma lógica)
        if (d.tratamientos_seleccionados && d.tratamientos_seleccionados.length > 0) {
            const tratInput = d.tratamientos_seleccionados.map(t => t.toLowerCase());

            const tratamientosEncontrados = await CatTratamiento.findAll({
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('nombre')),
                    { [Op.in]: tratInput }
                )
            });

            for (const trat of tratamientosEncontrados) {
                await ConsultaTratamiento.create({ id_consulta: idC, id_tratamiento: trat.id_tratamiento });
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
        const { nombre } = req.query; // El término que escribió el usuario

        if (!nombre) return res.json([]);

        // Búsqueda Avanzada: Concatena "Nombre + Espacio + Apellido" y busca en eso
        const clientes = await Cliente.findAll({
            where: Sequelize.where(
                Sequelize.fn('concat', Sequelize.col('Cliente.nombre'), ' ', Sequelize.col('Cliente.apellido')),
                {
                    [Op.like]: `%${nombre}%`
                }
            ),
            include: [
                { model: Antecedentes },
                {
                    model: Consulta,
                    include: [
                        Sintomas,
                        AgudezaVisual,
                        GraduacionAnterior,
                        GraduacionActual,
                        Venta,
                        { model: CatTipoGraduacion },
                        { model: CatTratamiento }
                    ]
                }
            ]
        });

        res.json(clientes);

    } catch (error) {
        console.error('Error detallado al buscar historial:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
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
    console.log(`🔄 Iniciando actualización de consulta ID: ${req.params.id}`);
    
    try {
        const idC = req.params.id;
        const d = req.body;

        // 1. Actualizar Datos Básicos
        await Consulta.update(
            { observaciones_generales: d.observaciones_generales }, 
            { where: { id_consulta: idC } }
        );

        // 2. Actualizar Antecedentes (Si se envió ID de cliente)
        if (d.id_cliente) {
            await Antecedentes.update(
                { 
                    personales: d.antecedentes.personales, 
                    no_personales: d.antecedentes.no_personales 
                },
                { where: { id_cliente: d.id_cliente } }
            );
        }

        // 3. Actualizar Síntomas (Borrar y Crear)
        await Sintomas.destroy({ where: { id_consulta: idC } });
        await Sintomas.create({
            id_consulta: idC,
            vision_borrosa: d.sintomas.vision_borrosa,
            operaciones_oculares: d.sintomas.operaciones,
            ojos_rojos: d.sintomas.ojos_rojos,
            dolor_cabeza: d.sintomas.dolor_cabeza,
            lagrimeo: d.sintomas.lagrimeo
        });

        // 4. Actualizar Agudeza Visual
        await AgudezaVisual.destroy({ where: { id_consulta: idC } });
        // Aseguramos valores por defecto para evitar error de NULL
        await AgudezaVisual.create({ id_consulta: idC, tipo: 'SinCorreccion', ...d.agudeza_sin });
        await AgudezaVisual.create({ id_consulta: idC, tipo: 'ConLentes', ...d.agudeza_con });

        // 5. Actualizar Graduaciones
        await GraduacionAnterior.destroy({ where: { id_consulta: idC } });
        await GraduacionAnterior.create({ id_consulta: idC, ...d.grad_anterior });

        await GraduacionActual.destroy({ where: { id_consulta: idC } });
        await GraduacionActual.create({ id_consulta: idC, ...d.grad_actual });

        // ============================================================
        // 6. GESTIÓN DE INVENTARIO Y VENTA (LÓGICA SEGURA)
        // ============================================================
        
        // A. RESTAURAR STOCK (Devolver lo que se vendió antes)
        const ventasAnteriores = await Venta.findAll({ where: { id_consulta: idC } });
        
        for (const ventaVieja of ventasAnteriores) {
            // Buscamos producto de forma segura (insensible a mayúsculas para SQLite)
            const productoOriginal = await Producto.findOne({ 
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('marca')), 
                    Sequelize.fn('lower', ventaVieja.modeloComprado)
                )
            });

            if (productoOriginal) {
                const stockActual = parseInt(productoOriginal.stock) || 0;
                const devolver = parseInt(ventaVieja.cantidad_piezas) || 1; 
                
                await productoOriginal.update({ stock: stockActual + devolver });
                console.log(`   -> Stock restaurado: +${devolver} a ${productoOriginal.marca}`);
            }
        }

        // B. BORRAR VENTAS VIEJAS
        await Venta.destroy({ where: { id_consulta: idC } });

        // C. REGISTRAR NUEVAS VENTAS Y DESCONTAR STOCK
        if (d.productos_venta && d.productos_venta.length > 0) {
            for (const item of d.productos_venta) {
                
                // Intentamos buscar por ID primero, si no por Nombre (Seguro)
                let prod = null;
                if (item.id_producto && item.id_producto != 0) {
                    prod = await Producto.findByPk(item.id_producto);
                } 
                
                // Si no se encontró por ID, buscamos por nombre (insensible a mayúsculas)
                if (!prod && item.nombre) {
                    prod = await Producto.findOne({ 
                        where: Sequelize.where(
                            Sequelize.fn('lower', Sequelize.col('marca')), 
                            Sequelize.fn('lower', item.nombre)
                        )
                    });
                }

                // Si encontramos el producto, descontamos
                if (prod) {
                    const stockActual = parseInt(prod.stock) || 0;
                    const restar = parseInt(item.cantidad) || 1;
                    await prod.update({ stock: stockActual - restar });
                    console.log(`   -> Stock descontado: -${restar} a ${prod.marca}`);
                }

                // Creamos la venta
                await Venta.create({
                    id_consulta: idC,
                    id_cliente: d.id_cliente,
                    modeloComprado: item.nombre,
                    tipoMaterial: item.material || '',
                    cantidadPagada: d.venta.cantidad || 0, // Dinero total
                    cantidad_piezas: item.cantidad || 1    // Piezas de este item
                });
            }
        }

        // ============================================================
        // 7. ACTUALIZAR CATÁLOGOS (FIX SQLITE)
        // ============================================================
        const { ConsultaTipoGrad, ConsultaTratamiento, CatTipoGraduacion, CatTratamiento } = require('./models/catalogos.model');
        const { Op } = require('sequelize');

        // Limpiar relaciones viejas
        await ConsultaTipoGrad.destroy({ where: { id_consulta: idC } });
        await ConsultaTratamiento.destroy({ where: { id_consulta: idC } });

        // Insertar nuevas (Lentes)
        if (d.lentes_seleccionados && d.lentes_seleccionados.length > 0) {
            const lentesInput = d.lentes_seleccionados.map(l => l.toLowerCase());
            const lentesEncontrados = await CatTipoGraduacion.findAll({
                where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('nombre')), { [Op.in]: lentesInput })
            });
            for (const lente of lentesEncontrados) {
                await ConsultaTipoGrad.create({ id_consulta: idC, id_tipo_grad: lente.id_tipo_grad });
            }
        }

        // Insertar nuevos (Tratamientos)
        if (d.tratamientos_seleccionados && d.tratamientos_seleccionados.length > 0) {
            const tratInput = d.tratamientos_seleccionados.map(t => t.toLowerCase());
            const tratamientosEncontrados = await CatTratamiento.findAll({
                where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('nombre')), { [Op.in]: tratInput })
            });
            for (const trat of tratamientosEncontrados) {
                await ConsultaTratamiento.create({ id_consulta: idC, id_tratamiento: trat.id_tratamiento });
            }
        }

        res.json({ success: true, message: 'Consulta actualizada correctamente' });

    } catch (error) {
        console.error('❌ Error CRÍTICO al actualizar:', error);
        // Esto enviará el error exacto al navegador para que sepamos qué pasó
        res.status(500).json({ success: false, message: 'Error servidor: ' + error.message });
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
        // 1. Sincronizar Base de Datos
        // Usamos { force: false } para que NO borre los datos de tus clientes cuando reinicies la PC.
        // Solo creará las tablas si el archivo sqlite no existe.
        await sequelize.sync({ force: false });
        console.log('Base de datos sincronizada.');

        // 2. Insertar los datos obligatorios (Admin y Catálogos)
        await sembrarDatosIniciales();

        // 3. Arrancar el servidor Express
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error CRÍTICO al iniciar:', error);
    }
}

// llamar a la funcion que inicia todo
iniciarServidor();