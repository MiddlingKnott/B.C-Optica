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
  // Detectar botón AGREGAR
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("agregar-btn-inv")) {
    window.location.href = "AñadirProducto.html";  // ← aquí tu HTML para agregar
  }
});

// Detectar botón EDITAR
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("editar-btn-inv")) {
    abrirModalInventario(e.target);
  }
});

function abrirModalInventario(boton) {
  const tabla = boton.previousElementSibling; // La <table> generada arriba
  const filas = tabla.querySelectorAll("tr");

  // Crear fondo del modal
  const fondo = document.createElement("div");
  fondo.style.position = "fixed";
  fondo.style.inset = "0";
  fondo.style.background = "rgba(0,0,0,0.5)";
  fondo.style.display = "flex";
  fondo.style.justifyContent = "center";
  fondo.style.alignItems = "center";
  fondo.style.zIndex = "9999";

  // Crear modal
  const modal = document.createElement("div");
  modal.style.background = "white";
  modal.style.padding = "20px";
  modal.style.borderRadius = "10px";
  modal.style.width = "350px";
  modal.style.maxHeight = "80vh";
  modal.style.overflowY = "auto";

  let html = `<h3>Editar tabla</h3>`;

  filas.forEach((fila, i) => {
    if (i === 0) return; // Saltar encabezados

    const celdas = fila.querySelectorAll("td");

    celdas.forEach((celda, j) => {
      html += `
        <label>Fila ${i}, Columna ${j+1}</label>
        <input type="text" class="campo-edit" data-fila="${i}" data-col="${j}" value="${celda.innerText}" style="width:100%; margin-bottom:10px;">
      `;
    });
  });

  html += `
    <div style="display:flex; justify-content:right; gap:10px; margin-top:10px;">
      <button id="guardarTabla">Guardar</button>
      <button id="cerrarTabla">Cancelar</button>
    </div>
  `;

  modal.innerHTML = html;
  fondo.appendChild(modal);
  document.body.appendChild(fondo);

  // Cerrar modal
  document.getElementById("cerrarTabla").onclick = () => fondo.remove();

  // Guardar cambios en tabla
  document.getElementById("guardarTabla").onclick = () => {
    const inputs = document.querySelectorAll(".campo-edit");

    inputs.forEach(inpt => {
      const f = inpt.dataset.fila;
      const c = inpt.dataset.col;

      const celda = filas[f].querySelectorAll("td")[c];
      celda.innerText = inpt.value;
    });

    fondo.remove();
  };
}
