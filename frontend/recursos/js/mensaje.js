document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".catalogo-form");
    const boton = document.getElementById("boton-consulta");

    boton.addEventListener("click", function (e) {
        e.preventDefault();
        const tamano = document.getElementById("tamano").value;
        const estilo = document.getElementById("estilo").value;

        const cabo = document.querySelector("input[name='cabo']:checked");
        const caboValor = cabo ? cabo.value : "No seleccionado";

        const grabadoLugar = document.getElementById("grabado-lugar").value;
        const grabadoTexto = document.getElementById("grabado-texto").value.trim() || "Sin texto";

        let mensaje = "Hola! Quiero un presupuesto para un cuchillo personalizado:%0A";
        mensaje += `• Tamaño: ${tamano}%0A`;
        mensaje += `• Estilo: ${estilo}%0A`;
        mensaje += `• Cabo: ${caboValor}%0A`;
        mensaje += `• Grabado en: ${grabadoLugar}%0A`;
        mensaje += `• Texto del grabado: ${grabadoTexto}%0A`;

        const numero = "3512428444";

        const url = `https://wa.me/${numero}?text=${mensaje}`;

        window.open(url, "_blank");
    });
});
