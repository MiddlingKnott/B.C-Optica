// 🕒 Reloj y fecha (formato estándar)
function updateClock() {
    const now = new Date();
    const date = now.toLocaleDateString('es-MX');
    const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('date').textContent = date;
    document.getElementById('time').textContent = time;
  }
  setInterval(updateClock, 1000);
  updateClock();
  
  // 📋 Manejo del formulario
  document.getElementById('formProducto').addEventListener('submit', (e) => {
    e.preventDefault();
    const marca = document.getElementById('marca').value;
    const piezas = document.getElementById('piezas').value;
  
    alert(`Producto añadido:\nMarca: ${marca}\nPiezas: ${piezas}`);
    e.target.reset();
  });
  