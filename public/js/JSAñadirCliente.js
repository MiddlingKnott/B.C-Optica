// 🕒 Reloj y fecha (formato unificado)
function updateClock() {
    const now = new Date();
    const date = now.toLocaleDateString('es-MX');
    const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('fecha').textContent = date;
    document.getElementById('hora').textContent = time;
  }
  setInterval(updateClock, 1000);
  updateClock();
  
  // 📋 Manejo del formulario
  document.getElementById('formCliente').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const fecha_nac = document.getElementById('fecha_nac').value;
    const edad = document.getElementById('edad').value;
  
    alert(`Cliente agregado:\nNombre: ${nombre}\nFecha de nacimiento: ${fecha_nac}\nEdad: ${edad}`);
    e.target.reset();
  });
  