let carritoVenta = [];
document.addEventListener("DOMContentLoaded", async function () {

    // Elementos del DOM
    var modal = document.getElementById("clinicalModal");
    var span = document.getElementsByClassName("close-button")[0];
    var headerInfo = document.getElementById("datos-paciente-header");
    var inputIdCliente = document.getElementById("id_cliente_hidden");
    var form = document.getElementById("clinicalForm");
    var btnSubmit = document.querySelector(".submit-btn");
    var tituloModal = document.querySelector(".modal-content h2");

    // 1. LEER DATOS DE LA URL
    const params = new URLSearchParams(window.location.search);

    // Parametros para CREAR (Vienen de Añadir Cliente o Botón Nueva Consulta)
    const idClienteUrl = params.get('id');
    const nombreUrl = params.get('nombre');
    const apellidoUrl = params.get('apellido');
    const edadUrl = params.get('edad');

    // Parametros para EDITAR (Vienen del botón Editar en Historial)
    const mode = params.get('mode'); // 'edit'
    const idConsultaEdit = params.get('id_consulta');
    const idClienteEdit = params.get('id_cliente');

    // ============================================================
    // CASO A: MODO EDICIÓN (Cargar datos existentes)
    // ============================================================
    if (mode === 'edit' && idConsultaEdit) {
        tituloModal.textContent = "Editar Consulta Histórica";
        btnSubmit.textContent = "Actualizar Cambios";

        // Ponemos el ID del cliente en el input oculto (necesario para antecedentes)
        if (idClienteEdit) inputIdCliente.value = idClienteEdit;

        // Abrimos modal
        modal.style.display = "block";

        // Mostramos mensaje de carga
        headerInfo.innerHTML = "Cargando datos de la consulta...";

        try {
            // Pedimos los datos al backend
            const res = await fetch(`/api/consultas/${idConsultaEdit}`);
            if (!res.ok) throw new Error("Error al obtener datos");

            const data = await res.json();

            // LLENAMOS EL FORMULARIO CON LOS DATOS DE LA BD
            llenarFormulario(data);

            // Actualizamos el header con nombre real
            // 2. ACTUALIZAMOS EL ENCABEZADO (Header)
            if (data.Cliente) {
                // Preparamos la fecha solo para guardarla en oculto (backend la necesita)
                const fechaObj = new Date(data.fecha);
                const year = fechaObj.getUTCFullYear();
                const month = String(fechaObj.getUTCMonth() + 1).padStart(2, '0');
                const day = String(fechaObj.getUTCDate()).padStart(2, '0');
                const fechaFormatted = `${year}-${month}-${day}`;

                // --- CAMBIO: DISEÑO MINIMALISTA (Solo Nombre) ---
                headerInfo.innerHTML = `
                    <div style="text-align: center;">
                        <h2 style="margin: 0; color: #0056b3; font-size: 24px;">
                             ${data.Cliente.nombre} ${data.Cliente.apellido}
                        </h2>

                        <input type="hidden" id="input_fecha_consulta" value="${fechaFormatted}">
                    </div>
                `;
            }

        } catch (error) {
            console.error(error);
            alert("Error al cargar la consulta para editar.");
        }
    }

    // ============================================================
    // CASO B: MODO CREACIÓN (Paciente Nuevo o Nueva Consulta)
    // ============================================================
    else if (idClienteUrl && nombreUrl) {

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hoyInput = `${year}-${month}-${day}`; // Ejemplo: "2025-11-26"

        headerInfo.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 1.1em;">
            <div>
                <strong>Paciente:</strong> ${nombreUrl} ${apellidoUrl} &nbsp;|&nbsp;
                <strong>Edad:</strong> 
                <input type="number" value="${edadUrl}" disabled >
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <strong>Fecha de Consulta:</strong> 
                <input type="date" id="input_fecha_consulta" value="${hoyInput}" 
                       style="padding: 5px; border: 1px solid #007bff; border-radius: 5px; font-weight: bold; color: #333;">
            </div>
        </div>
    `;

        inputIdCliente.value = idClienteUrl;
        modal.style.display = "block";

        document.getElementById('antecedentes_personales').value = "";
        document.getElementById('antecedentes_no_personales').value = "";

        // Precargar antecedentes si ya existen
        fetch(`/api/clientes/${idClienteUrl}/antecedentes`)
            .then(res => res.json())
            .then(data => {
                if (data.personales) {
                    document.getElementById('antecedentes_personales').value = data.personales;
                }
                if (data.no_personales) {
                    document.getElementById('antecedentes_no_personales').value = data.no_personales;
                }
            })
            .catch(err => console.log("Cliente nuevo sin antecedentes previos"));
    }

    // LLAMADA CLAVE PARA LLENAR EL SELECT
    cargarProductosInventario();

    // Lógica del botón de agregar producto al carrito
    document.getElementById('btn_agregar_producto').addEventListener('click', () => {
        const select = document.getElementById('select_producto_venta');
        const material = document.getElementById('temp_material').value;
        const cantidad = document.getElementById('temp_cantidad').value;

        const idProd = select.value;
        const selectedOption = select.options[select.selectedIndex];

        if (!idProd || cantidad < 1) {
            alert("Selecciona un producto y una cantidad válida.");
            return;
        }

        // Agregamos al array global
        carritoVenta.push({
            id_producto: idProd,
            nombre: selectedOption.getAttribute('data-nombre') || selectedOption.textContent,
            material: material,
            cantidad: parseInt(cantidad)
        });

        // Actualizamos la tabla visual
        actualizarTablaCarrito();

        // Limpiamos inputs
        select.value = "";
        document.getElementById('temp_material').value = "";
        document.getElementById('temp_cantidad').value = "1";
    });

    // 3. CERRAR MODAL 
    span.onclick = function () {
        if (confirm("¿Seguro que deseas cerrar? Se perderán los datos no guardados.")) {
            modal.style.display = "none";
            // Limpiamos la URL para evitar reaperturas accidentales
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = "Inicio.html";
        }
    }

    // 4. MANEJAR EL ENVÍO DEL FORMULARIO (POST O PUT)
    form.onsubmit = async function (event) {
        event.preventDefault();

        // Recolección de datos
        const datosConsulta = {
            id_cliente: inputIdCliente.value,
            fecha_consulta: getSafeValue('input_fecha_consulta'),
            observaciones_generales: document.getElementById('observaciones').value,

            antecedentes: {
                personales: document.getElementById('antecedentes_personales').value,
                no_personales: document.getElementById('antecedentes_no_personales').value
            },

            sintomas: {
                vision_borrosa: obtenerValorRadio('vision_borrosa'),
                operaciones: obtenerBooleanoRadio('operaciones'),
                ojos_rojos: obtenerBooleanoRadio('ojos_rojos'),
                dolor_cabeza: obtenerBooleanoRadio('dolor_cabeza'),
                lagrimeo: obtenerBooleanoRadio('lagrimeo')
            },

            agudeza_sin: {
                vl_od: document.getElementById('av_lejana_od_sin').value,
                vl_oi: document.getElementById('av_lejana_oi_sin').value,
                vl_ao: document.getElementById('av_lejana_ao_sin').value,
                vc_od: document.getElementById('av_cercana_od_sin').value,
                vc_oi: document.getElementById('av_cercana_oi_sin').value,
                vc_ao: document.getElementById('av_cercana_ao_sin').value
            },
            agudeza_con: {
                vl_od: document.getElementById('av_lejana_od_con').value,
                vl_oi: document.getElementById('av_lejana_oi_con').value,
                vl_ao: document.getElementById('av_lejana_ao_con').value,
                vc_od: document.getElementById('av_cercana_od_con').value,
                vc_oi: document.getElementById('av_cercana_oi_con').value,
                vc_ao: document.getElementById('av_cercana_ao_con').value
            },

            grad_anterior: {
                od_esf: document.getElementById('ant_od_esf').value, od_cyl: document.getElementById('ant_od_cyl').value, od_eje: document.getElementById('ant_od_eje').value, od_add: document.getElementById('ant_od_add').value,
                oi_esf: document.getElementById('ant_oi_esf').value, oi_cyl: document.getElementById('ant_oi_cyl').value, oi_eje: document.getElementById('ant_oi_eje').value, oi_add: document.getElementById('ant_oi_add').value,
            },

            grad_actual: {
                od_esf: document.getElementById('act_od_esf').value, od_cyl: document.getElementById('act_od_cyl').value, od_eje: document.getElementById('act_od_eje').value, od_add: document.getElementById('act_od_add').value,
                oi_esf: document.getElementById('act_oi_esf').value, oi_cyl: document.getElementById('act_oi_cyl').value, oi_eje: document.getElementById('act_oi_eje').value, oi_add: document.getElementById('act_oi_add').value,
                dip: document.getElementById('dip').value
            },

            // Arrays de checkboxes
            lentes_seleccionados: obtenerArrayCheckboxes('lente'),
            tratamientos_seleccionados: obtenerArrayCheckboxes('tratamiento'),

            venta: {
                cantidad: document.getElementById('cantidad_pagada').value,
            },
            productos_venta: carritoVenta
        };

        try {
            // DECIDIMOS SI ES CREAR (POST) O EDITAR (PUT)
            let url, method;

            if (mode === 'edit' && idConsultaEdit) {
                url = `/api/consultas/${idConsultaEdit}`;
                method = 'PUT';
            } else {
                url = '/api/consultas/agregar';
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosConsulta)
            });

            const result = await response.json();
            if (result.success) {
                alert(mode === 'edit' ? '¡Actualización exitosa!' : '¡Consulta guardada exitosamente!');
                window.location.href = 'HistorialClinico.html';
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al enviar datos');
        }
    }
});

// ============================================================
// FUNCIÓN MAESTRA: LLENAR FORMULARIO (Para Editar)
// ============================================================
function llenarFormulario(data) {

    // 1. Antecedentes (Vienen del Cliente)
    if (data.Cliente && (data.Cliente.AntecedentesPatologico || data.Cliente.AntecedentesPatologicos)) {
        const ant = data.Cliente.AntecedentesPatologico || data.Cliente.AntecedentesPatologicos;
        setValue('antecedentes_personales', ant.personales);
        setValue('antecedentes_no_personales', ant.no_personales);
    }

    // 2. Observaciones
    setValue('observaciones', data.observaciones_generales);

    // 3. Síntomas (Radios y Checkboxes)
    const sin = data.Sintoma || data.Sintomas;
    if (sin) {
        marcarRadio('vision_borrosa', sin.vision_borrosa);
        marcarRadioSiNo('operaciones', sin.operaciones_oculares);
        marcarRadioSiNo('ojos_rojos', sin.ojos_rojos);
        marcarRadioSiNo('dolor_cabeza', sin.dolor_cabeza);
        marcarRadioSiNo('lagrimeo', sin.lagrimeo);
    }

    // 4. Agudeza Visual
    const listaAV = data.AgudezaVisuals || data.AgudezaVisual || [];
    const avArray = Array.isArray(listaAV) ? listaAV : [listaAV];

    const sinCorr = avArray.find(a => a && a.tipo === 'SinCorreccion');
    const conLentes = avArray.find(a => a && a.tipo === 'ConLentes');

    if (sinCorr) {
        setValue('av_lejana_od_sin', sinCorr.vl_od); setValue('av_lejana_oi_sin', sinCorr.vl_oi); setValue('av_lejana_ao_sin', sinCorr.vl_ao);
        setValue('av_cercana_od_sin', sinCorr.vc_od); setValue('av_cercana_oi_sin', sinCorr.vc_oi); setValue('av_cercana_ao_sin', sinCorr.vc_ao);
    }
    if (conLentes) {
        setValue('av_lejana_od_con', conLentes.vl_od); setValue('av_lejana_oi_con', conLentes.vl_oi); setValue('av_lejana_ao_con', conLentes.vl_ao);
        setValue('av_cercana_od_con', conLentes.vc_od); setValue('av_cercana_oi_con', conLentes.vc_oi); setValue('av_cercana_ao_con', conLentes.vc_ao);
    }

    // 5. Graduaciones
    if (data.GraduacionAnterior) {
        const ga = data.GraduacionAnterior;
        setValue('ant_od_esf', ga.od_esf); setValue('ant_od_cyl', ga.od_cyl); setValue('ant_od_eje', ga.od_eje); setValue('ant_od_add', ga.od_add);
        setValue('ant_oi_esf', ga.oi_esf); setValue('ant_oi_cyl', ga.oi_cyl); setValue('ant_oi_eje', ga.oi_eje); setValue('ant_oi_add', ga.oi_add);
    }
    if (data.GraduacionActual) {
        const gn = data.GraduacionActual;
        setValue('act_od_esf', gn.od_esf); setValue('act_od_cyl', gn.od_cyl); setValue('act_od_eje', gn.od_eje); setValue('act_od_add', gn.od_add);
        setValue('act_oi_esf', gn.oi_esf); setValue('act_oi_cyl', gn.oi_cyl); setValue('act_oi_eje', gn.oi_eje); setValue('act_oi_add', gn.oi_add);
        setValue('dip', gn.dip);
    }

    const ventasRecibidas = data.Venta || data.Ventas || [];
    carritoVenta = [];

    // Obtenemos todas las opciones del select (que ya cargamos con el inventario)
    const opcionesSelect = document.getElementById('select_producto_venta').options;

    if (Array.isArray(ventasRecibidas) && ventasRecibidas.length > 0) {
        setValue('cantidad_pagada', ventasRecibidas[0].cantidadPagada);
        ventasRecibidas.forEach(v => {

            let idEncontrado = 0;
            // Recorremos las opciones del select para ver si alguna coincide con el nombre guardado
            for (let i = 0; i < opcionesSelect.length; i++) {
                if (opcionesSelect[i].text.includes(v.modeloComprado)) {
                    idEncontrado = opcionesSelect[i].value;
                    break;
                }
            }

            carritoVenta.push({
                id_producto: idEncontrado,
                nombre: v.modeloComprado,
                material: v.tipoMaterial,
                cantidad: v.cantidad_piezas
            });
        });
        actualizarTablaCarrito();
    }

    // 7. Checkboxes Múltiples (Catálogos)
    // Lentes
    const lentes = data.Cat_TiposGraduacions || []; // Sequelize pluraliza
    lentes.forEach(l => marcarCheckbox('lente', l.nombre));

    // Tratamientos
    const tratam = data.Cat_Tratamientos || [];
    tratam.forEach(t => marcarCheckbox('tratamiento', t.nombre));
}


// ============================================================
// HELPERS
// ============================================================

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

function obtenerValorRadio(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : 'ninguno';
}

function obtenerBooleanoRadio(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return (el && el.value === 'si');
}

function obtenerArrayCheckboxes(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Helpers para MARCAR (Setear) valores en el formulario
function marcarRadio(name, value) {
    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
}

function marcarRadioSiNo(name, boolValue) {
    const valorAUsar = boolValue ? 'si' : 'no';
    marcarRadio(name, valorAUsar);
}

function marcarCheckbox(name, value) {
    let el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) {
        el.checked = true;
    } else {
        el = document.querySelector(`input[name="${name}"][value="${value.toLowerCase()}"]`);
        if (el) el.checked = true;
    }
}
function getSafeValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}
// --- LÓGICA DEL CARRITO (VENTA MÚLTIPLE) ---

// La función que dibuja la tabla visual
function actualizarTablaCarrito() {
    const tbody = document.querySelector('#tabla_carrito_visual tbody');
    tbody.innerHTML = '';

    if (carritoVenta.length === 0) {
        tbody.innerHTML = '<tr id="fila_vacia"><td colspan="4" style="text-align:center; color:gray;">Ningún producto agregado.</td></tr>';
        return;
    }

    carritoVenta.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.material || '-'}</td>
            <td>${item.cantidad}</td>
            <td><button type="button" onclick="eliminarDelCarrito(${index})" style="color:red; border:none; background:none; cursor:pointer; display:block; margin:auto;">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Hace global la función para que el onclick la encuentre
window.eliminarDelCarrito = function (index) {
    carritoVenta.splice(index, 1);
    actualizarTablaCarrito();
}

// --- FUNCIÓN PARA LLENAR EL SELECT (Organización por Categoría) ---
async function cargarProductosInventario() {
    const select = document.getElementById('select_producto_venta');

    try {
        const res = await fetch('/api/productos');
        const productos = await res.json();

        const productosAgrupados = productos.reduce((acc, prod) => {
            (acc[prod.categoria] = acc[prod.categoria] || []).push(prod);
            return acc;
        }, {});

        select.innerHTML = '<option value="">-- Seleccione un armazón/producto --</option>';

        for (const categoria in productosAgrupados) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = categoria;

            productosAgrupados[categoria].forEach(prod => {
                const option = document.createElement('option');
                option.value = prod.id_producto;
                option.textContent = `${prod.marca} (Stock: ${prod.stock})`;
                option.setAttribute('data-nombre', prod.marca);

                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }

    } catch (error) {
        console.error("Error cargando inventario:", error);
        select.innerHTML = '<option value="">Error al cargar productos</option>';
    }
}