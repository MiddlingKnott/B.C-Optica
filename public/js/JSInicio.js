// Reloj y fecha en tiempo real (formato unificado en todas las interfaces)
function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('es-MX');
  const time = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const fechaEl = document.getElementById('fecha');
  const horaEl = document.getElementById('hora');

  if (fechaEl) fechaEl.textContent = date;
  if (horaEl) horaEl.textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

document.getElementById("NuevoCliente").addEventListener("click", function () {
  window.location.href = "AñadirCliente.html";
});

document.getElementById("BuscarCliente").addEventListener("click", function () {
  window.location.href = "Clientes.html";
});

document.getElementById("NuevoProducto").addEventListener("click", function () {
  window.location.href = "AñadirProducto.html";
});
document.getElementById("BuscarProducto").addEventListener("click", function () {
  window.location.href = "Inventario.html";
});

async function cargarAvisos() {
    const lista = document.getElementById('lista-avisos');
    lista.innerHTML = '<li class="placeholder">Verificando inventario...</li>';

    try {
        // 1. Llamamos a nuestra ruta real del backend
        const res = await fetch('/api/avisos/stock-bajo');
        
        if (!res.ok) throw new Error('Error de red');
        
        const productos = await res.json();

        // 2. Limpiamos la lista
        lista.innerHTML = '';

        // 3. Si no hay productos bajos, mostramos mensaje verde
        if (productos.length === 0) {
            lista.innerHTML = '<li class="placeholder" style="color: green;">Sin alertas de inventario.</li>';
            return;
        }

        // 4. Si hay productos, creamos las alertas
        productos.forEach(prod => {
            const li = document.createElement('li');
            
            // Estilo crítico si el stock es 0
            const estilo = prod.stock === 0 ? 'color: red; font-weight: bold;' : 'color: #d9534f;';

            li.innerHTML = `
                <span style="${estilo}">
                    <strong>${prod.marca}</strong>
                </span>
                <br>
                <span style="font-size: 0.9em; color: #555;">
                    (Quedan: ${prod.stock} pzs)
                </span>
            `;
            
            // Estilo básico para separar items
            li.style.marginBottom = "10px";
            li.style.borderBottom = "1px solid #eee";
            li.style.paddingBottom = "5px";

            lista.appendChild(li);
        });

    } catch (err) {
        console.error('Error cargando avisos:', err);
        lista.innerHTML = '<li class="placeholder">Error al cargar avisos.</li>';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarAvisos();
});