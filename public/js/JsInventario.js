// public/js/JsInventario.js

// --- 1. RELOJ ---
function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('es-MX');
  const time = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('date').textContent = date;
  document.getElementById('time').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// --- 2. BOTÓN AÑADIR PRODUCTO ---
document.getElementById("btn-agregarProd").addEventListener("click", function () {
  window.location.href = "AñadirProducto.html";
});

// --- 3. LÓGICA DE PESTAÑAS (TABS) - ESTO FALTABA ---
document.addEventListener('DOMContentLoaded', () => {

  // Carga inicial: Simula clic en la pestaña que tenga la clase 'active' (la primera)
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    const categoriaInicial = activeTab.getAttribute('data-categoria');
    cargarProductos(categoriaInicial);
  }

  // Lógica para cambiar de pestaña
  const tabs = document.querySelectorAll('.tab-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // A. Quitar 'active' de todas
      tabs.forEach(t => t.classList.remove('active'));
      // B. Poner 'active' a la actual
      tab.classList.add('active');

      // C. Cargar datos
      const categoria = tab.getAttribute('data-categoria');
      cargarProductos(categoria);
    });
  });

  const searchInput = document.getElementById('search');
  const searchBtn = document.querySelector('.search-btn');

  searchBtn.addEventListener('click', () => {
    const termino = searchInput.value;
    realizarBusqueda(termino);
  });

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      realizarBusqueda(searchInput.value);
    }
  });
});

// --- FUNCIÓN DE BÚSQUEDA GLOBAL ---
async function realizarBusqueda(termino) {
  const contenedor = document.getElementById('contenedor-principal-inventario');
  const tabs = document.querySelectorAll('.tab-btn');

  // 1. Quitamos la clase 'active' de las pestañas para indicar que estamos en modo búsqueda
  tabs.forEach(t => t.classList.remove('active'));

  // 2. Si no hay término, volvemos a la pestaña inicial (opcional) o mostramos mensaje
  if (!termino.trim()) {
    cargarProductos('Armazon Linea'); // O el que quieras por defecto
    tabs[0].classList.add('active'); // Reactivamos la primera pestaña
    return;
  }

  contenedor.innerHTML = '<p>Buscando coincidencias...</p>';

  try {
    // 3. Petición al backend con el parámetro ?search=
    const response = await fetch(`/api/productos?search=${encodeURIComponent(termino)}`);
    const productos = await response.json();

    if (productos.length === 0) {
      contenedor.innerHTML = `<p>No se encontraron productos que coincidan con: "<strong>${termino}</strong>"</p>`;
      return;
    }

    // 4. AGRUPAR PRODUCTOS POR CATEGORÍA
    // Esto es clave: Creamos un objeto donde las llaves son las categorías
    const productosPorCategoria = {};

    productos.forEach(prod => {
      if (!productosPorCategoria[prod.categoria]) {
        productosPorCategoria[prod.categoria] = [];
      }
      productosPorCategoria[prod.categoria].push(prod);
    });

    // 5. GENERAR HTML PARA CADA GRUPO
    let htmlFinal = `<h2>Resultados de búsqueda para: "${termino}"</h2>`;

    // Recorremos las categorías encontradas (Object.keys)
    for (const [categoria, listaProds] of Object.entries(productosPorCategoria)) {

      htmlFinal += `
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #0056b3; border-bottom: 2px solid #ddd; padding-bottom: 5px;">
                        Encontrados en: ${categoria}
                    </h3>
                    <table class="tabla-inventario">
                        <thead>
                            <tr>
                                <th>Marca</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

      listaProds.forEach(prod => {
        htmlFinal += `
                    <tr>
                        <td>${prod.marca}</td>
                        <td>${prod.stock}</td>
                        <td>
                            <button class="btn-editar" 
                                onclick="abrirModalEditar('${prod.id_producto}', '${prod.marca}', '${prod.stock}')">
                                Editar
                            </button>
                            <button class="btn-eliminar" 
                                onclick="eliminarProducto('${prod.id_producto}')">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `;
      });

      htmlFinal += `</tbody></table></div>`;
    }

    contenedor.innerHTML = htmlFinal;

  } catch (error) {
    console.error(error);
    contenedor.innerHTML = '<p>Error al realizar la búsqueda.</p>';
  }
}

// --- 4. FUNCIÓN CARGAR PRODUCTOS ---
async function cargarProductos(categoria) {
  // Seleccionamos el contenedor único que tienes en tu HTML
  const contenedor = document.getElementById('contenedor-principal-inventario');

  contenedor.innerHTML = '<p>Cargando...</p>';

  try {
    const response = await fetch(`/api/productos?categoria=${encodeURIComponent(categoria)}`);
    const productos = await response.json();

    if (productos.length === 0) {
      contenedor.innerHTML = `<p>No hay productos en: <strong>${categoria}</strong></p>`;
      return;
    }

    // Construimos la tabla
    let html = `
            <h3>${categoria}</h3>
            <table class="tabla-inventario">
                <thead>
                    <tr>
                        <th>Marca</th>
                        <th>Stock</th>
                        <th>Acciones</th> 
                    </tr>
                </thead>
                <tbody>
        `;

    productos.forEach(prod => {
      html += `
                <tr>
                    <td>${prod.marca}</td>
                    <td>${prod.stock}</td>
                    <td>
                        <button class="btn-editar" 
                            onclick="abrirModalEditar('${prod.id_producto}', '${prod.marca}', '${prod.stock}')">
                            Editar
                        </button>
                        
                        <button class="btn-eliminar" 
                            onclick="eliminarProducto('${prod.id_producto}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;

  } catch (error) {
    console.error(error);
    contenedor.innerHTML = '<p>Error al cargar.</p>';
  }
}

// --- 5. LÓGICA PARA ELIMINAR ---
async function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

  try {
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      alert('Producto eliminado');
      location.reload();
    } else {
      alert('Error al eliminar');
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión');
  }
}

// --- 6. LÓGICA PARA EDITAR (MODAL) ---

function abrirModalEditar(id, marca, stock) {
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-marca').value = marca;
  document.getElementById('edit-stock').value = stock;

  // Mostramos el modal quitando el display: none
  document.getElementById('modal-editar').style.display = 'flex';
}

// Botón Cancelar
document.getElementById('btn-cancelar-edicion').addEventListener('click', () => {
  document.getElementById('modal-editar').style.display = 'none';
});

// Botón Guardar Cambios
document.getElementById('btn-guardar-cambios').addEventListener('click', async () => {
  const id = document.getElementById('edit-id').value;
  const nuevaMarca = document.getElementById('edit-marca').value;
  const nuevoStock = document.getElementById('edit-stock').value;

  try {
    const res = await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marca: nuevaMarca, stock: nuevoStock })
    });

    const data = await res.json();

    if (data.success) {
      alert('Producto actualizado correctamente');
      document.getElementById('modal-editar').style.display = 'none';
      location.reload();
    } else {
      alert('Error al actualizar');
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión');
  }
});