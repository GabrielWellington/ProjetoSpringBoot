async function carregarPendentes() {
    try {
        const resposta = await fetch("http://localhost:8080/consultas/pendentes");
        if (!resposta.ok) throw new Error("Erro ao buscar consultas pendentes");

        const pendentes = await resposta.json();
        const tabela = document.querySelector("#tabelaPendentes tbody");
        tabela.innerHTML = "";

        if (pendentes.length === 0) {
            tabela.innerHTML = `<tr><td colspan="7">Nenhuma consulta pendente.</td></tr>`;
            return;
        }

        pendentes.forEach(c => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${c.id}</td>
                <td>${c.paciente ? c.paciente.nome : "—"}</td>
                <td>${c.medico ? c.medico.nome : "—"}</td>
                <td>${c.dataConsulta || "-"}</td>
                <td>${c.horaConsulta || "-"}</td>
                <td class="status">${c.status}</td>
                <td>
                    <button class="confirmar" onclick="confirmarConsulta(${c.id})">Confirmar</button>
                    <button class="cancelar" onclick="cancelarConsulta(${c.id})">Cancelar</button>
                </td>
            `;
            tabela.appendChild(linha);
        });
    } catch (erro) {
        console.error("Erro ao carregar consultas pendentes:", erro);
        alert("Erro ao carregar consultas pendentes.");
    }
}

async function carregarConfirmadas() {
    try {
        const resposta = await fetch("http://localhost:8080/consultas/confirmadas");
        if (!resposta.ok) throw new Error("Erro ao buscar consultas confirmadas");

        const confirmadas = await resposta.json();
        const tabela = document.querySelector("#tabelaConfirmadas tbody");
        tabela.innerHTML = "";

        if (confirmadas.length === 0) {
            tabela.innerHTML = `<tr><td colspan="8">Nenhuma consulta confirmada.</td></tr>`;
            return;
        }

        confirmadas.forEach(c => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${c.id}</td>
                <td>${c.paciente ? c.paciente.nome : "—"}</td>
                <td>${c.medico ? c.medico.nome : "—"}</td>
                <td>${c.dataConsulta || "-"}</td>
                <td>${c.horaConsulta || "-"}</td>
                <td>${c.dataConfirmacao ? c.dataConfirmacao : "-"}</td>
                <td class="status">${c.status}</td>
                <td>
                    <button class="cancelar" onclick="cancelarConsulta(${c.id})">Cancelar</button>
                </td>
            `;
            tabela.appendChild(linha);
        });
    } catch (erro) {
        console.error("Erro ao carregar consultas confirmadas:", erro);
        alert("Erro ao carregar consultas confirmadas.");
    }
}

async function confirmarConsulta(id) {
    if (confirm("Deseja confirmar esta consulta?")) {
        try {
            const resp = await fetch(`http://localhost:8080/consultas/confirmar/${id}`, { method: "PUT" });
            if (!resp.ok) throw new Error("Erro ao confirmar consulta");

            alert("Consulta confirmada com sucesso!");
            carregarPendentes();
            carregarConfirmadas();
        } catch (erro) {
            console.error("Erro ao confirmar consulta:", erro);
            alert("Erro ao confirmar consulta.");
        }
    }
}

async function cancelarConsulta(id) {
    if (confirm("Deseja cancelar esta consulta?")) {
        try {
            const resp = await fetch(`http://localhost:8080/consultas/cancelar/${id}`, { method: "PUT" });
            if (!resp.ok) throw new Error("Erro ao cancelar consulta");

            alert("Consulta cancelada!");
            carregarPendentes();
            carregarConfirmadas();
        } catch (erro) {
            console.error("Erro ao cancelar consulta:", erro);
            alert("Erro ao cancelar consulta.");
        }
    }
}

// 🔹 Ao carregar a página, busca as duas listas
carregarPendentes();
carregarConfirmadas();
