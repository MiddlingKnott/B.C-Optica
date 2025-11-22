function updateClock() {
    const now = new Date();
    const date = now.toLocaleDateString('es-MX');
    const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('date').textContent = date;
    document.getElementById('time').textContent = time;
  }
  setInterval(updateClock, 1000);
  updateClock();
  
  // Seleccionar todos los botones Editar de todas las secciones
document.querySelectorAll(".btn-edit").forEach((btn) => {
  btn.addEventListener("click", () => abrirModal(btn));
});

function abrirModal(boton) {

  // Obtener la sección donde se hizo clic
  const section = boton.closest(".table-section");

  // Obtener títulos (th) y valores (td)
  const titulos = section.querySelectorAll("table tr:nth-child(1) th");
  const celdas = section.querySelectorAll("table tr:nth-child(2) td");

  // Crear el modal (fondo)
  const fondo = document.createElement("div");
  fondo.style.position = "fixed";
  fondo.style.inset = "0";
  fondo.style.background = "rgba(0,0,0,0.5)";
  fondo.style.display = "flex";
  fondo.style.justifyContent = "center";
  fondo.style.alignItems = "center";
  fondo.style.zIndex = "9999";

  // Crear contenido del modal
  const contenido = document.createElement("div");
  contenido.style.background = "white";
  contenido.style.padding = "20px";
  contenido.style.borderRadius = "10px";
  contenido.style.width = "350px";
  contenido.style.maxHeight = "80vh";
  contenido.style.overflowY = "auto";

  // Construir los campos dinámicamente
  let html = `<h3>Editar ${section.querySelector("h3").innerText}</h3>`;

  titulos.forEach((th, index) => {
      const valor = celdas[index].innerText;
      html += `
          <label>${th.innerText}:</label>
          <textarea class="campo-edit" data-index="${index}" style="width:100%;height:60px;">${valor}</textarea>
      `;
  });

  html += `
      <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
          <button id="guardarModal">Guardar</button>
          <button id="cerrarModal">Cancelar</button>
      </div>
  `;

  contenido.innerHTML = html;
  fondo.appendChild(contenido);
  document.body.appendChild(fondo);

  // Botón cerrar
  document.getElementById("cerrarModal").onclick = () => fondo.remove();

  // Botón guardar
  document.getElementById("guardarModal").onclick = () => {
      const campos = document.querySelectorAll(".campo-edit");

      campos.forEach((campo) => {
          const i = campo.dataset.index;
          celdas[i].innerText = campo.value;
      });

      fondo.remove();
  };
}
