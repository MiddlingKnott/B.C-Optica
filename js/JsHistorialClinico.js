// Reloj / Fecha (igual que el resto de interfaces)
function actualizarRelojHistorial() {
    const now = new Date();
  
    const fecha = now.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  
    const hora = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  
    const fechaEl = document.getElementById('fecha');
    const horaEl = document.getElementById('hora');
  
    if (fechaEl) fechaEl.textContent = fecha;
    if (horaEl) horaEl.textContent = hora;
  }
  
  setInterval(actualizarRelojHistorial, 1000);
  actualizarRelojHistorial();
  
  // Función pequeña para navegación (si usas secciones en el mismo HTML)
  function mostrarSeccion(id) {
    // placeholder: si luego usas single-page, implementa aquí
    console.log('mostrarSeccion ->', id);
  }
  