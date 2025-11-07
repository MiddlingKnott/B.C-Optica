// 🕒 Reloj y fecha en tiempo real (formato unificado en todas las interfaces)
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

// 📅 Sincronizar input de fecha con la fecha actual
const inputFecha = document.getElementById('calendar');
if (inputFecha) {
  const hoy = new Date().toISOString().slice(0, 10);
  inputFecha.value = hoy;
  inputFecha.addEventListener('change', (e) => {
    console.log('Fecha seleccionada:', e.target.value);
    // Aquí puedes filtrar citas o cargar datos según la fecha seleccionada
  });
}

// 📦 Cargar avisos desde la "base de datos" o lista temporal
async function cargarAvisos() {
  const lista = document.getElementById('lista-avisos');

  try {
    // Ejemplo de datos simulados (remplázalos con tu endpoint real)
    // const res = await fetch('http://localhost:3000/api/avisos');
    // const avisos = await res.json();

    const avisos = [
      { id: 1, texto: 'Lentes A.pro modelo X: 2 unidades restantes' },
      { id: 2, texto: 'Cristales antirreflejantes: stock bajo' }
    ];

    // Limpiar y renderizar avisos
    lista.innerHTML = '';
    if (!avisos || avisos.length === 0) {
      lista.innerHTML = '<li class="placeholder">No hay avisos</li>';
      return;
    }

    avisos.forEach(av => {
      const li = document.createElement('li');
      li.textContent = av.texto;
      lista.appendChild(li);
    });

  } catch (err) {
    console.error('Error cargando avisos:', err);
    lista.innerHTML = '<li class="placeholder">Error al cargar avisos</li>';
  }
}

// Ejecutar carga inicial (y opcionalmente cada X segundos)
cargarAvisos();
// setInterval(cargarAvisos, 30000); // actualiza cada 30s (opcional)
