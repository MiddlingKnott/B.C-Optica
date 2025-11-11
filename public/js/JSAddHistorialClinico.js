
function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('es-MX');
  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('date').textContent = date;
  document.getElementById('time').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();
