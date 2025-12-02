document.addEventListener("DOMContentLoaded", function() {
    const tipoSelect = document.getElementById("tipo");
    const camposMedico = document.getElementById("camposMedico");
    const camposPaciente = document.getElementById("camposPaciente");

    tipoSelect.addEventListener("change", function() {
        const tipo = tipoSelect.value;

        camposMedico.classList.add("oculto");
        camposPaciente.classList.add("oculto");

        if (tipo === "medico") {
            camposMedico.classList.remove("oculto");
        } else if (tipo === "paciente") {
            camposPaciente.classList.remove("oculto");
        }
    });
});
