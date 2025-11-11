// Espera a que el contenido del DOM esté cargado
document.addEventListener("DOMContentLoaded", function() {

    // Obtener los elementos del modal
    var modal = document.getElementById("clinicalModal");
    var btn = document.getElementById("openModalBtn");
    var span = document.getElementsByClassName("close-button")[0];

    // Cuando el usuario hace clic en el botón, abre el modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // Cuando el usuario hace clic en <span> (x), cierra el modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Opcional: Manejar el envío del formulario
    var form = document.getElementById("clinicalForm");
    form.onsubmit = function(event) {
        event.preventDefault(); // Evita que la página se recargue
        alert("Historial clínico agregado (simulación).");
        // Aquí iría tu lógica para enviar los datos a un servidor
        modal.style.display = "none"; // Cierra el modal al enviar
    }
});