// Reloj y fecha 
function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('es-MX');
  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('fecha').textContent = date;
  document.getElementById('hora').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// --- LÓGICA PARA CALCULAR EDAD VISUALMENTE ---
const inputFecha = document.getElementById('fecha_nac');
const inputEdad = document.getElementById('edad');

inputFecha.addEventListener('change', function() {
    const fechaSeleccionada = this.value;
    
    if (fechaSeleccionada) {
        const edadCalculada = calcularEdad(fechaSeleccionada);
        inputEdad.value = edadCalculada;
    } else {
        inputEdad.value = '';
    }
});

// Función matemática para calcular edad exacta
function calcularEdad(fechaString) {
    const hoy = new Date();
    const cumpleanos = new Date(fechaString);
    
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const mes = hoy.getMonth() - cumpleanos.getMonth();

    // Ajustamos si aún no es el mes o el día del cumpleaños
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
}

// Manejo del formulario 
document.getElementById('formCliente').addEventListener('submit', async (e) => {
  e.preventDefault(); // Detiene el envío normal del formulario

  // 1. Obtenemos los valores de los inputs
  const nombre = document.getElementById('nombre').value;
  const fecha_nac = document.getElementById('fecha_nac').value;

  // 2. Creamos el objeto de datos que enviaremos
  const data = {
    nombre: nombre,
    fecha_nacimiento: fecha_nac, // El nombre debe coincidir con el del modelo
  };

  // 3. Usamos fetch() para enviar los datos al servidor
  try {
    const response = await fetch('/api/clientes/agregar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Le decimos que estamos enviando JSON
      },
      body: JSON.stringify(data) // Convertimos nuestro objeto a texto JSON
    });

    const result = await response.json(); // Leemos la respuesta del servidor

    if (result.success) {
      alert('¡Cliente agregado exitosamente!');

      const cliente = result.cliente; 

      window.location.href = `/RegistroClinico.html?id=${cliente.id_cliente}&nombre=${encodeURIComponent(cliente.nombre)}&edad=${cliente.edad}`;
    } else {
      // Mostramos el error que envió el servidor
      alert('Error al agregar cliente: ' + result.message);
    }

  } catch (error) {
    console.error('Error de red:', error);
    alert('Error de conexión. No se pudo agregar el cliente.');
  }
});