function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('es-MX');
  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('date').textContent = date;
  document.getElementById('time').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

document.getElementById("agregar-cliente").addEventListener("click", function () {
  window.location.href = "AñadirCliente.html";
});

document.addEventListener('DOMContentLoaded', () => {

  // Carga la tabla sin ninguna busqueda
  cargarClientes();

  // Selecciona los elementos de búsqueda
  const searchButton = document.querySelector('.search-btn');
  const searchInput = document.getElementById('search');

  searchButton.addEventListener('click', () => {
    cargarClientes(searchInput.value);
  });

  //vBuscar también al presionar "Enter"
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      cargarClientes(searchInput.value);
    }
  });
});

async function cargarClientes(searchTerm = '') { // Estará vacío al inicio
  try {

    // Construye la URL
    let url = '/api/clientes';
    if (searchTerm) {
      // Si hay un término, lo añade a la URL
      url += `?nombre=${encodeURIComponent(searchTerm)}`;
    }

    // 7. Llama a la ruta GET (ya sea la normal o la de búsqueda)
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error en el servidor: ' + response.statusText);
    }

    const clientes = await response.json();
    const tbody = document.getElementById('tabla-clientes-body');

    tbody.innerHTML = ''; 

    // 8. Si no hay resultados, muestra un mensaje
    if (clientes.length === 0) {
      if (searchTerm) {
        tbody.innerHTML = '<tr><td colspan="4">No se encontró ese cliente.</td></tr>';
      } else {
        tbody.innerHTML = '<tr><td colspan="4">No hay clientes registrados.</td></tr>';
      }
      return;
    }

    // 9. Recorre los resultados (filtrados o todos) y los muestra
    clientes.forEach(cliente => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
            <td>${cliente.nombre}</td>
            <td>${cliente.apellido || ''}</td>
            <td>${formatearFecha(cliente.fecha_nacimiento)}</td>
            <td>${cliente.edad}</td>
        `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error al cargar clientes:', error);
    const tbody = document.getElementById('tabla-clientes-body');
    tbody.innerHTML = '<tr><td colspan="4">Error al cargar datos.</td></tr>';
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
}