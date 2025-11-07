// Reloj / Fecha (formato unificado)
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

// Función pequeña para navegación (si usas secciones en el mismo HTML)
function mostrarSeccion(id) {
  console.log('mostrarSeccion ->', id);
}
