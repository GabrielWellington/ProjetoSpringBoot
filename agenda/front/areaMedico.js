// areaMedico.js completo — copie e cole no seu projeto

// função utilitária para obter idMedico de várias fontes
function getIdMedico() {
  // 1) diretamento do localStorage (chave usada antes)
  let id = localStorage.getItem("idMedico");
  if (id && id !== "null" && id !== "undefined") return id;

  // 2) pode estar dentro do usuarioLogado salvo no login
  try {
    const usuarioStr = localStorage.getItem("usuarioLogado");
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      if (usuario) {
        if (usuario.idMedico) return String(usuario.idMedico);
        if (usuario.medico && usuario.medico.idMedico) return String(usuario.medico.idMedico);
        if ((usuario.tipo || "").toLowerCase() === "medico" && usuario.id) return String(usuario.id);
      }
    }
  } catch (e) {
    console.warn("Não foi possível ler usuarioLogado:", e);
  }

  return null;
}

// ===================== CONSULTAS ===================== //
async function carregarConsultas() {
  const idMedico = getIdMedico();

  if (!idMedico) {
    console.error("idMedico não encontrado. Redirecionando para login.");
    alert("Erro: Médico não identificado. Faça login novamente.");
    window.location.href = "/login";
    return;
  }

  try {
    console.log("Buscando consultas para medico:", idMedico);
    const resp = await fetch(`http://localhost:8080/consultas/medico/${idMedico}`);
    if (!resp.ok) {
      // tenta extrair mensagem do backend
      let errText = `Erro ao buscar consultas (status ${resp.status})`;
      try {
        const j = await resp.json();
        if (j && j.erro) errText = j.erro;
      } catch (e) {}
      throw new Error(errText);
    }

    const consultas = await resp.json();
    console.log("Consultas recebidas:", consultas);

    const tbody = document.querySelector("#tabelaConsultas tbody");
    if (!tbody) {
      console.error("Tabela de consultas não encontrada no DOM.");
      return;
    }
    tbody.innerHTML = "";

    if (!Array.isArray(consultas) || consultas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Nenhuma consulta encontrada.</td></tr>`;
      return;
    }

    consultas.forEach(c => {
      // evita quebra por campos nulos — padroniza os campos
      const nomePaciente = c?.paciente?.nome || "Sem nome";
      const dataConsulta = c?.dataConsulta || "-";
      const horaConsulta = c?.horaConsulta || "-";
      const status = c?.status || "PENDENTE";
      const idConsulta = c?.id;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${nomePaciente}</td>
        <td>${dataConsulta}</td>
        <td>${horaConsulta}</td>
        <td>${status}</td>
        <td>
          ${["CONFIRMADA", "ATENDIDA"].includes(String(status).toUpperCase())
            ? `<button class="btn btn-primary btn-small" onclick="abrirProntuario(${idConsulta})">Prontuário</button>`
            : ""}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (erro) {
    console.error("Erro ao carregar consultas:", erro);
    // mostra mensagem leve ao usuário, sem bloquear
    const tbody = document.querySelector("#tabelaConsultas tbody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar consultas. Veja console.</td></tr>`;
  }
}

function abrirProntuario(idConsulta) {
  const modal = document.getElementById("prontuarioBackdrop");
  if (!modal) {
    console.error("Modal de prontuário não encontrado.");
    return;
  }
  modal.style.display = "flex";
  document.getElementById("prontuarioModal").setAttribute("data-id-consulta", idConsulta);

  // opcional: buscar dados da consulta para preencher o modal (se existir endpoint GET /consultas/{id})
  // como seu backend não tinha explicito, comentei — se existir, podemos descomentar e usar:
  // fetch(`http://localhost:8080/consultas/${idConsulta}`).then(... preencher campos ...)
}

async function salvarProntuario() {
  const idConsulta = document.getElementById("prontuarioModal").getAttribute("data-id-consulta");
  if (!idConsulta) {
    alert("Nenhuma consulta selecionada para salvar prontuário.");
    return;
  }

  const prontuario = {
    sintomas: document.getElementById("sintomas").value,
    duracaoSintomas: document.getElementById("duracao").value,
    historicoMedico: document.getElementById("historico").value,
    diagnostico: document.getElementById("diagnostico").value,
    prescricao: document.getElementById("prescricao").value,
    observacoes: document.getElementById("observacoes").value
  };

  try {
    const resp = await fetch(`http://localhost:8080/prontuarios/salvar/${idConsulta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prontuario)
    });
    if (!resp.ok) throw new Error("Erro ao salvar prontuário");
    alert("Prontuário salvo com sucesso!");
    document.getElementById("prontuarioBackdrop").style.display = "none";
    carregarConsultas();
  } catch (erro) {
    console.error("Erro ao salvar prontuário:", erro);
    alert("Erro ao salvar prontuário. Veja console para detalhes.");
  }
}

function fecharProntuario() {
  const modal = document.getElementById("prontuarioBackdrop");
  if (modal) modal.style.display = "none";
}

// ===================== DISPONIBILIDADES ===================== //
async function carregarDisponibilidades() {
  const idMedico = getIdMedico();
  if (!idMedico) {
    console.error("idMedico não encontrado para carregar disponibilidades.");
    return;
  }

  try {
    const resp = await fetch(`http://localhost:8080/disponibilidades/medico/${idMedico}`);
    if (!resp.ok) throw new Error("Erro ao buscar disponibilidades");
    const lista = await resp.json();
    const tbody = document.querySelector("#tabelaDisponibilidades tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Nenhuma disponibilidade cadastrada.</td></tr>`;
      return;
    }

    lista.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.diaSemana}</td>
        <td>${d.horaInicio}</td>
        <td>${d.horaFim}</td>
        <td>${d.intervaloMinutos}</td>
        <td>
          <button class="btn btn-danger btn-small" onclick="excluirDisponibilidade(${d.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    const tbody = document.querySelector("#tabelaDisponibilidades tbody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar disponibilidades.</td></tr>`;
  }
}

function abrirModalDisponibilidade() {
  const modal = document.getElementById("modalDisponibilidadeBackdrop");
  if (modal) modal.style.display = "flex";
}

function fecharModalDisponibilidade() {
  const modal = document.getElementById("modalDisponibilidadeBackdrop");
  if (modal) modal.style.display = "none";
}

async function salvarDisponibilidade() {
  const idMedico = getIdMedico();
  if (!idMedico) {
    alert("Médico não identificado. Faça login novamente.");
    window.location.href = "/login";
    return;
  }

  const disponibilidade = {
    diaSemana: document.getElementById("diaSemana").value,
    horaInicio: document.getElementById("horaInicio").value,
    horaFim: document.getElementById("horaFim").value,
    intervaloMinutos: parseInt(document.getElementById("intervalo").value)
  };

  try {
    const resp = await fetch(`http://localhost:8080/disponibilidades/adicionar/${idMedico}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(disponibilidade)
    });

    if (!resp.ok) throw new Error("Erro ao salvar disponibilidade");

    alert("Disponibilidade salva!");
    fecharModalDisponibilidade();
    carregarDisponibilidades();
  } catch (e) {
    console.error(e);
    alert("Erro ao salvar disponibilidade.");
  }
}

async function excluirDisponibilidade(id) {
  if (!confirm("Deseja realmente remover esta disponibilidade?")) return;
  try {
    const resp = await fetch(`http://localhost:8080/disponibilidades/excluir/${id}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro ao excluir");
    alert("Disponibilidade removida!");
    carregarDisponibilidades();
  } catch (e) {
    console.error(e);
    alert("Erro ao excluir disponibilidade.");
  }
}

// ===================== INIT & POLLING ===================== //
let pollingHandle = null;
window.onload = () => {
  // coloca nome do médico (se existir)
  const nomeMedico = localStorage.getItem("nomeMedico") || (() => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
      return usuario?.nome || usuario?.medico?.nome || "";
    } catch (e) { return ""; }
  })();
  if (nomeMedico && document.getElementById("medicoNome")) {
    document.getElementById("medicoNome").textContent = nomeMedico;
  }

  // carrega uma vez e inicia polling a cada 10s
  carregarConsultas();
  carregarDisponibilidades();

  if (pollingHandle) clearInterval(pollingHandle);
  pollingHandle = setInterval(() => {
    carregarConsultas();
    carregarDisponibilidades();
  }, 10000); // 10000ms = 10s
};

window.onclick = function (event) {
  const modals = ["prontuarioBackdrop", "modalDisponibilidadeBackdrop"];
  modals.forEach(id => {
    const modal = document.getElementById(id);
    if (event.target === modal) modal.style.display = "none";
  });
};
