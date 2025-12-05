const idMedico = 1; // ⚠️ Ajuste conforme o médico logado no sistema
const apiBase = "http://localhost:8080/disponibilidades";

const tabela = document.querySelector("#tabelaDisponibilidades tbody");
const btnAdicionar = document.getElementById("btnAdicionar");

async function carregarDisponibilidades() {
    tabela.innerHTML = "";
    const res = await fetch(`${apiBase}/medico/${idMedico}`);
    const dados = await res.json();

    dados.forEach(d => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d.diaSemana}</td>
            <td>${d.horaInicio}</td>
            <td>${d.horaFim}</td>
            <td>${d.intervaloMinutos} min</td>
            <td>
                <button onclick="excluirDisponibilidade(${d.id})">Excluir</button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

async function adicionarDisponibilidade() {
    const diaSemana = document.getElementById("diaSemana").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFim = document.getElementById("horaFim").value;
    const intervaloMinutos = document.getElementById("intervaloMinutos").value;

    if (!horaInicio || !horaFim) {
        alert("Informe hora inicial e final!");
        return;
    }

    const nova = { diaSemana, horaInicio, horaFim, intervaloMinutos };

    await fetch(`${apiBase}/adicionar/${idMedico}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nova)
    });

    await carregarDisponibilidades();
}

async function excluirDisponibilidade(id) {
    if (!confirm("Tem certeza que deseja excluir esta disponibilidade?")) return;

    await fetch(`${apiBase}/excluir/${id}`, { method: "DELETE" });
    await carregarDisponibilidades();
}

btnAdicionar.addEventListener("click", adicionarDisponibilidade);
carregarDisponibilidades();
