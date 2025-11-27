document.addEventListener('DOMContentLoaded', () => {

    // Elementos del DOM
    const btnSearch = document.getElementById('btnSearch');
    const inputSearch = document.getElementById('searchInput');
    const listaResultados = document.getElementById('listaResultados');
    const seccionDatos = document.getElementById('seccionDatos');
    const contenedorTablas = document.getElementById('contenedorTablas');
    const nombreClienteDisplay = document.getElementById('nombreClienteDisplay');
    const contenedorFechas = document.getElementById('contenedorFechas');
    const btnAdd = document.getElementById('btnAdd');
    const btnFiltrarFecha = document.getElementById('btnFiltrarFecha');
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');

    let clienteActual = null;

    // --- 1. EVENTOS DE BÚSQUEDA ---
    btnSearch.addEventListener('click', () => buscarHistorial(inputSearch.value));

    inputSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') buscarHistorial(inputSearch.value);
    });

    btnAdd.addEventListener('click', () => {
        if (!clienteActual) {
            alert("Por favor, primero busca y selecciona un paciente.");
            return;
        }
        // Redirigimos al formulario de registro con los datos del paciente seleccionado
        // Esto abrirá el modal automáticamente en modo "Crear Nueva Consulta"
        const url = `/RegistroClinico.html?id=${clienteActual.id_cliente}&nombre=${encodeURIComponent(clienteActual.nombre)}&edad=${clienteActual.edad}`;
        window.location.href = url;
    });

    btnFiltrarFecha.addEventListener('click', async () => {
        const inicio = fechaInicio.value;
        const fin = fechaFin.value;

        if (!inicio || !fin) {
            alert("Por favor selecciona ambas fechas.");
            return;
        }

        // Limpiamos vista anterior
        contenedorTablas.style.display = 'none';
        seccionDatos.style.display = 'none';
        listaResultados.style.display = 'block';
        listaResultados.innerHTML = '<p style="padding:10px;">Buscando consultas...</p>';

        try {
            const res = await fetch(`/api/consultas/por-fecha?inicio=${inicio}&fin=${fin}`);
            const consultas = await res.json();

            listaResultados.innerHTML = '';

            if (consultas.length === 0) {
                listaResultados.innerHTML = '<p style="padding:10px; color:red;">No hubo consultas en ese rango de fechas.</p>';
                return;
            }

            // Título de resultados
            const titulo = document.createElement('div');
            titulo.style.padding = "10px";
            titulo.style.fontWeight = "bold";
            titulo.style.backgroundColor = "#e9ecee";
            titulo.textContent = `Resultados del ${inicio} al ${fin}:`;
            listaResultados.appendChild(titulo);

            // Renderizar lista de consultas encontradas
            consultas.forEach(c => {
                const div = document.createElement('div');
                div.className = 'cliente-item'; // Reutilizamos tu estilo CSS
                
                // Estilos extra
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';
                div.style.cursor = 'pointer';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';

                // Formato de fecha bonito
                const fechaStr = new Date(c.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' });

                div.innerHTML = `
                    <span><strong>${fechaStr}</strong></span>
                    <span> ${c.Cliente ? c.Cliente.nombre : 'Cliente desconocido'}</span>
                `;
                
                div.onclick = async () => {
                    // Buscamos al cliente completo por su nombre para cargar su perfil normal
                    // (Esto reutiliza tu lógica existente de cargarCliente)
                    const resCliente = await fetch(`/api/historial/buscar?nombre=${encodeURIComponent(c.Cliente.nombre)}`);
                    const clientesFound = await resCliente.json();
                    
                    if(clientesFound.length > 0) {
                        cargarCliente(clientesFound[0]); // Tu función existente
                    }
                };
                
                listaResultados.appendChild(div);
            });

        } catch (error) {
            console.error(error);
            listaResultados.innerHTML = '<p>Error al buscar por fechas.</p>';
        }
    });

    // --- 2. FUNCIÓN BUSCAR CLIENTE ---
    async function buscarHistorial(termino) {
        if (!termino.trim()) return;

        // Reiniciamos la vista
        contenedorTablas.style.display = 'none';
        seccionDatos.style.display = 'none';
        listaResultados.style.display = 'block';
        listaResultados.innerHTML = '<p style="padding:10px;">Buscando...</p>';

        try {
            const res = await fetch(`/api/historial/buscar?nombre=${encodeURIComponent(termino)}`);
            const clientes = await res.json();

            console.log("Clientes encontrados:", clientes); // DEPURACIÓN

            listaResultados.innerHTML = '';

            if (clientes.length === 0) {
                listaResultados.innerHTML = '<p style="padding:10px; color:red;">No se encontraron pacientes.</p>';
                return;
            }

            // Renderizar lista
            clientes.forEach(cliente => {
                const div = document.createElement('div');
                div.className = 'cliente-item';
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';
                div.style.cursor = 'pointer';
                div.innerHTML = `<strong>${cliente.nombre}</strong> (Edad: ${cliente.edad})`;

                div.onclick = () => cargarCliente(cliente);
                listaResultados.appendChild(div);
            });

        } catch (error) {
            console.error(error);
            listaResultados.innerHTML = '<p>Error de conexión.</p>';
        }
        clienteActual = null;
    }

    // --- 3. FUNCIÓN CARGAR CLIENTE Y FECHAS ---
    function cargarCliente(cliente) {

        // Ocultamos lista y mostramos encabezado del cliente
        listaResultados.style.display = 'none';
        seccionDatos.style.display = 'block';
        nombreClienteDisplay.textContent = cliente.nombre;
        clienteActual = cliente;

        // A. Llenar Antecedentes
        const ant = cliente.AntecedentesPatologico || cliente.AntecedentesPatologicos;
        if (ant) {
            setText('td_ant_pers', ant.personales);
            setText('td_ant_no_pers', ant.no_personales);
        } else {
            setText('td_ant_pers', 'Sin registro');
            setText('td_ant_no_pers', 'Sin registro');
        }

        // B. Generar Botones de Fechas (ROBUSTEZ AGREGADA)
        contenedorFechas.innerHTML = '';

        // Buscamos las consultas ya sea en plural o singular
        let listaConsultas = cliente.Consultas || cliente.Consulta || [];

        // Si no es un array (es un solo objeto), lo convertimos en array
        if (!Array.isArray(listaConsultas) && listaConsultas.id_consulta) {
            listaConsultas = [listaConsultas];
        }

        // SI NO HAY CONSULTAS, MOSTRAMOS MENSAJE Y SALIMOS
        if (listaConsultas.length === 0) {
            contenedorFechas.innerHTML = '<p style="color:red; padding:10px;">Este paciente existe, pero no tiene historial clínico registrado.</p>';
            contenedorTablas.style.display = 'none';
            return;
        }

        // Ordenar por fecha (más reciente primero)
        listaConsultas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        listaConsultas.forEach((consulta, index) => {
            const btn = document.createElement('button');
            btn.className = 'fecha-btn';

            const fechaObj = new Date(consulta.fecha);
            // Ajuste UTC para evitar desfase de día
            const fechaStr = fechaObj.toLocaleDateString('es-MX', { timeZone: 'UTC' });

            btn.textContent = `${fechaStr}`;

            btn.onclick = () => {
                document.querySelectorAll('.fecha-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                cargarConsulta(consulta);
            };

            contenedorFechas.appendChild(btn);

            // Clic automático en la primera (más reciente)
            if (index === 0) btn.click();
        });
    }

    // --- 4. FUNCIÓN CARGAR DETALLES (TABLAS) ---
    function cargarConsulta(c) {
        contenedorTablas.style.display = 'block';

        // Agregamos un botón maestro de edición al principio
        const divEdicion = document.createElement('div');
        divEdicion.style.textAlign = 'right';
        divEdicion.style.marginBottom = '10px';
        divEdicion.innerHTML = `
        <button style="background: #ffc107; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold;">
            Editar esta Consulta Completa
        </button>
    `;

        // Al dar clic, nos vamos al formulario con el ID de la consulta
        divEdicion.querySelector('button').onclick = () => {
            window.location.href = `/RegistroClinico.html?mode=edit&id_consulta=${c.id_consulta}&id_cliente=${c.id_cliente}`;
        };

        // Insertamos el botón antes de las tablas (o donde prefieras)
        // (Asegúrate de limpiar si ya existía uno antes)
        const existingBtn = document.getElementById('btn-edit-master');
        if (existingBtn) existingBtn.remove();
        divEdicion.id = 'btn-edit-master';

        contenedorTablas.insertBefore(divEdicion, contenedorTablas.firstChild);

        // Observaciones
        setText('td_observaciones', c.observaciones_generales);

        // Síntomas
        const sin = c.Sintoma || c.Sintomas;
        if (sin) {
            setText('td_sin_vision', sin.vision_borrosa);
            setText('td_sin_oper', sin.operaciones_oculares ? 'Sí' : 'No');
            setText('td_sin_rojos', sin.ojos_rojos ? 'Sí' : 'No');
            setText('td_sin_cabeza', sin.dolor_cabeza ? 'Sí' : 'No');
            setText('td_sin_lagri', sin.lagrimeo ? 'Sí' : 'No');
        } else {
            limpiarIds(['td_sin_vision', 'td_sin_oper', 'td_sin_rojos', 'td_sin_cabeza', 'td_sin_lagri']);
        }

        // Agudeza Visual (Array)
        // Sequelize puede devolver 'AgudezaVisuals' o 'AgudezaVisual'
        const listaAV = c.AgudezaVisuals || c.AgudezaVisual || [];
        // Asegurar que sea array
        const arrayAV = Array.isArray(listaAV) ? listaAV : [listaAV];

        const sinCorr = arrayAV.find(a => a && a.tipo === 'SinCorreccion');
        const conLentes = arrayAV.find(a => a && a.tipo === 'ConLentes');

        if (sinCorr) {
            setText('td_av_sin_lod', sinCorr.vl_od); setText('td_av_sin_loi', sinCorr.vl_oi); setText('td_av_sin_lao', sinCorr.vl_ao);
            setText('td_av_sin_cod', sinCorr.vc_od); setText('td_av_sin_coi', sinCorr.vc_oi); setText('td_av_sin_cao', sinCorr.vc_ao);
        } else {
            limpiarIds(['td_av_sin_lod', 'td_av_sin_loi', 'td_av_sin_lao', 'td_av_sin_cod', 'td_av_sin_coi', 'td_av_sin_cao']);
        }

        if (conLentes) {
            setText('td_av_con_lod', conLentes.vl_od); setText('td_av_con_loi', conLentes.vl_oi); setText('td_av_con_lao', conLentes.vl_ao);
            setText('td_av_con_cod', conLentes.vc_od); setText('td_av_con_coi', conLentes.vc_oi); setText('td_av_con_cao', conLentes.vc_ao);
        } else {
            limpiarIds(['td_av_con_lod', 'td_av_con_loi', 'td_av_con_lao', 'td_av_con_cod', 'td_av_con_coi', 'td_av_con_cao']);
        }

        // Graduaciones
        const gAnt = c.GraduacionAnterior;
        if (gAnt) {
            setText('td_grant_esf_od', gAnt.od_esf); setText('td_grant_cyl_od', gAnt.od_cyl); setText('td_grant_eje_od', gAnt.od_eje); setText('td_grant_add_od', gAnt.od_add);
            setText('td_grant_esf_oi', gAnt.oi_esf); setText('td_grant_cyl_oi', gAnt.oi_cyl); setText('td_grant_eje_oi', gAnt.oi_eje); setText('td_grant_add_oi', gAnt.oi_add);
        } else {
            limpiarTablaGraduacion('grant');
        }

        const gAct = c.GraduacionActual;
        if (gAct) {
            setText('td_gract_esf_od', gAct.od_esf); setText('td_gract_cyl_od', gAct.od_cyl); setText('td_gract_eje_od', gAct.od_eje); setText('td_gract_add_od', gAct.od_add);
            setText('td_gract_esf_oi', gAct.oi_esf); setText('td_gract_cyl_oi', gAct.oi_cyl); setText('td_gract_eje_oi', gAct.oi_eje); setText('td_gract_add_oi', gAct.oi_add);
        } else {
            limpiarTablaGraduacion('gract');
        }

        // Catálogos (Arrays)
        const lentes = c.Cat_TiposGraduacions || c.Cat_TiposGraduacion || [];
        const tratam = c.Cat_Tratamientos || c.Cat_Tratamiento || [];

        setText('td_lentes_cat', Array.isArray(lentes) ? lentes.map(l => l.nombre).join(', ') : '-');
        setText('td_tratam_tipo', Array.isArray(tratam) ? tratam.map(t => t.nombre).join(', ') : '-');

        // Venta
        let venta = null;
        if (Array.isArray(c.Venta) && c.Venta.length > 0) venta = c.Venta[0];
        else if (Array.isArray(c.Ventas) && c.Ventas.length > 0) venta = c.Ventas[0];
        else if (c.Venta && !Array.isArray(c.Venta)) venta = c.Venta;

        if (venta) {
            setText('td_venta_modelo', venta.modeloComprado);
            setText('td_venta_material', venta.tipoMaterial);
            setText('td_venta_monto', venta.cantidadPagada);
        } else {
            setText('td_venta_modelo', '-');
            setText('td_venta_material', '-');
            setText('td_venta_monto', '-');
        }
    }

    function setText(id, texto) {
        const el = document.getElementById(id);
        if (el) el.textContent = (texto === null || texto === undefined || texto === '') ? '-' : texto;
    }

    function limpiarIds(ids) {
        ids.forEach(id => setText(id, '-'));
    }

    function limpiarTablaGraduacion(prefijo) {
        const campos = ['esf', 'cyl', 'eje', 'add'];
        const ojos = ['od', 'oi'];
        ojos.forEach(ojo => {
            campos.forEach(campo => setText(`td_${prefijo}_${campo}_${ojo}`, '-'));
        });
    }
});