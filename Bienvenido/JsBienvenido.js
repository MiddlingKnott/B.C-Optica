// Reloj y fecha en tiempo real
function actualizarReloj() {
    const ahora = new Date();
    document.getElementById("hora").textContent = ahora.toLocaleTimeString('es-MX', { hour12: false });
    document.getElementById("fecha").textContent = ahora.toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
  setInterval(actualizarReloj, 1000);
  actualizarReloj();
  
  // Sincronizar input de fecha con la fecha actual (opcional)
  const inputFecha = document.getElementById('calendar');
  if (inputFecha) {
    const hoy = new Date().toISOString().slice(0,10);
    inputFecha.value = hoy;
    inputFecha.addEventListener('change', (e) => {
      console.log('Fecha seleccionada:', e.target.value);
      // aquí puedes filtrar citas o cargar datos según fecha
    });
  }
  
  // Cargar avisos desde la "base de datos"
  // --- Ajusta la URL '/api/avisos' a tu endpoint local (por ejemplo: http://localhost:3000/avisos)
  async function cargarAvisos() {
    const lista = document.getElementById('lista-avisos');
  
    try {
      // Si tienes un API local descomenta y adapta la siguiente línea:
      // const res = await fetch('http://localhost:3000/api/avisos');
      // const avisos = await res.json();
  
      // --- Ejemplo de datos temporales (remplázalo por la respuesta real del servidor) ---
      const avisos = [
        { id:1, texto: 'Lentes A.pro modelo X: 2 unidades restantes' },
        { id:2, texto: 'Cristales antirreflejantes: stock bajo' }
      ];
      // ------------------------------------------------------------------------------
  
      // Limpiar y renderizar
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
  // setInterval(cargarAvisos, 30_000); // actualiza cada 30s (opcional)
  