// 🕒 Reloj con formato 'es-MX'
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
  
  // 📋 Función para generar tabla simulada
  function generarTabla() {
    return `
      <table>
        <tr><th>Marca</th><th>Piezas</th></tr>
        <tr><td>Armo</td><td>3</td></tr>
        <tr><td>Guess</td><td>5</td></tr>
        <tr><td>Vogue</td><td>2</td></tr>
      </table>
      <button class="agregar-btn-inv">Agregar</button>
      <button class="editar-btn-inv">Editar</button>
    `;
  }
  
  // 🎛️ Mostrar/Ocultar secciones
  const botones = document.querySelectorAll("button[id^='mostrar-']");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.id.replace("mostrar-", "");
      const divTabla = document.getElementById(`tabla-${id}`);
  
      if (divTabla.style.display === "block") {
        divTabla.style.display = "none";
      } else {
        document.querySelectorAll(".tabla").forEach(div => div.style.display = "none");
        divTabla.innerHTML = generarTabla();
        divTabla.style.display = "block";
      }
    });
  });
  