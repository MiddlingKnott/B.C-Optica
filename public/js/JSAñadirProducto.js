function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('es-MX');
  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('date').textContent = date;
  document.getElementById('time').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

document.getElementById('formProducto').addEventListener('submit', async (e) => {
  e.preventDefault(); // Detiene el envío normal

  // 1. Obtener valores del HTML
  const marca = document.getElementById('marca').value;
  const piezas = document.getElementById('piezas').value;
  const categoria = document.getElementById('categoria').value;

  // 2. Crear objeto de datos
  const data = {
    marca: marca,
    piezas: piezas,
    categoria: categoria
  };

  try {
    // 3. Enviar al servidor
    const response = await fetch('/api/productos/agregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // 4. Mostrar resultado
    if (result.success) {
      alert(`¡Producto añadido exitosamente!\n\nMarca: ${marca}\nCategoría: ${categoria}`);
      e.target.reset(); // Limpiar formulario
    } else {
      alert('Hubo un error al agregar el producto: ' + result.message);
    }

  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor.');
  }
});
