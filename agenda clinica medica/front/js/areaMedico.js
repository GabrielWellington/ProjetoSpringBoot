// areaMedico.js completo — com prontuário, cancelar, remover e pesquisa de paciente

function getIdMedico() {
  let id = localStorage.getItem("idMedico");
  if (id && id !== "null" && id !== "undefined") return id;

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
      tbody.innerHTML = `<tr><td colspan="6">Nenhuma consulta encontrada.</td></tr>`;
      return;
    }

    consultas.forEach(c => {
      const nomePaciente = c?.paciente?.nome || "Sem nome";
      const dataConsulta = c?.dataConsulta || "-";
      const horaConsulta = c?.horaConsulta || "-";
      const status = c?.status || "PENDENTE";
      const idConsulta = c?.id;

      const tr = document.createElement("tr");

      // Determina quais botões mostrar baseado no status
      let botoes = '';

      if (status === "CONFIRMADA" || status === "PENDENTE") {
        botoes += `<button class="btn btn-primary btn-small" onclick="abrirProntuario(${idConsulta})">Prontuário</button>`;
        botoes += ` <button class="btn btn-danger btn-small" onclick="cancelarConsulta(${idConsulta})">Cancelar</button>`;
      }

      if (status === "ATENDIDA" || status === "CANCELADA") {
        botoes += `<button class="btn btn-danger btn-small" onclick="removerConsulta(${idConsulta})">Remover</button>`;
      }

      tr.innerHTML = `
        <td>${nomePaciente}</td>
        <td>${dataConsulta}</td>
        <td>${horaConsulta}</td>
        <td>${status}</td>
        <td>
          ${botoes}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (erro) {
    console.error("Erro ao carregar consultas:", erro);
    const tbody = document.querySelector("#tabelaConsultas tbody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar consultas. Veja console.</td></tr>`;
  }
}

// ===================== PRONTUÁRIO ===================== //
function abrirProntuario(idConsulta) {
  const modal = document.getElementById("prontuarioBackdrop");
  if (!modal) {
    console.error("Modal de prontuário não encontrado.");
    return;
  }
  modal.style.display = "flex";
  document.getElementById("prontuarioModal").setAttribute("data-id-consulta", idConsulta);

  // Limpa os campos ao abrir
  document.getElementById("sintomas").value = "";
  document.getElementById("duracao").value = "";
  document.getElementById("historico").value = "";
  document.getElementById("diagnostico").value = "";
  document.getElementById("prescricao").value = "";
  document.getElementById("observacoes").value = "";
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
    historico: document.getElementById("historico").value,
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

function marcarAtendidaModal() {
  const idConsulta = document.getElementById("prontuarioModal").getAttribute("data-id-consulta");
  if (!idConsulta) {
    alert("Nenhuma consulta selecionada.");
    return;
  }

  if (confirm("Deseja marcar esta consulta como atendida?")) {
    marcarAtendida(idConsulta);
  }
}

async function marcarAtendida(idConsulta) {
  try {
    const resp = await fetch(`http://localhost:8080/consultas/atender/${idConsulta}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });
    if (!resp.ok) throw new Error("Erro ao marcar como atendida");
    alert("Consulta marcada como atendida com sucesso!");
    document.getElementById("prontuarioBackdrop").style.display = "none";
    carregarConsultas();
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao marcar como atendida.");
  }
}

function fecharProntuario() {
  const modal = document.getElementById("prontuarioBackdrop");
  if (modal) modal.style.display = "none";
}

// ===================== CANCELAR CONSULTA ===================== //
async function cancelarConsulta(idConsulta) {
  if (!confirm("Deseja realmente cancelar esta consulta?")) return;

  try {
    const resp = await fetch(`http://localhost:8080/consultas/cancelar/${idConsulta}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });
    if (!resp.ok) throw new Error("Erro ao cancelar consulta");
    alert("Consulta cancelada com sucesso!");
    carregarConsultas();
  } catch (erro) {
    console.error("Erro ao cancelar consulta:", erro);
    alert("Erro ao cancelar consulta.");
  }
}

// ===================== REMOVER CONSULTA ===================== //
async function removerConsulta(idConsulta) {
  if (!confirm("Deseja realmente remover esta consulta?")) return;

  try {
    const resp = await fetch(
      `http://localhost:8080/consultas/${idConsulta}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      }
    );

    // 🔧 Lê resposta do servidor
    const texto = await resp.text();

    if (!resp.ok) {
      throw new Error(texto || "Erro ao remover consulta");
    }

    alert(texto || "Consulta removida com sucesso!");
    carregarConsultas();

  } catch (erro) {
    console.error("Erro ao remover consulta:", erro);
    alert(`Erro: ${erro.message}`);
  }
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

// ===================== PESQUISA DE PACIENTE ===================== //
async function pesquisarPaciente() {
  const nomePaciente = document.getElementById("pesquisaPaciente").value.trim();

  if (!nomePaciente) {
    alert("Digite o nome do paciente para pesquisar.");
    return;
  }

  try {
    // Busca todos os pacientes e filtra pelo nome
    const respPacientes = await fetch("http://localhost:8080/pacientes");
    if (!respPacientes.ok) throw new Error("Erro ao buscar pacientes");

    const pacientes = await respPacientes.json();
    const pacienteFiltrado = pacientes.find(p =>
      p.nome.toLowerCase().includes(nomePaciente.toLowerCase())
    );

    if (!pacienteFiltrado) {
      alert("Paciente não encontrado.");
      return;
    }

    // Busca as consultas do paciente
    const respConsultas = await fetch(
      `http://localhost:8080/consultas/paciente/${pacienteFiltrado.idPaciente}`
    );
    if (!respConsultas.ok) throw new Error("Erro ao buscar consultas");

    const consultas = await respConsultas.json();

    // Abre o modal de pesquisa
    abrirModalPesquisa(pacienteFiltrado, consultas);
  } catch (erro) {
    console.error("Erro ao pesquisar paciente:", erro);
    alert("Erro ao pesquisar paciente.");
  }
}

function abrirModalPesquisa(paciente, consultas) {
  const modal = document.getElementById("modalPesquisaBackdrop");
  if (!modal) {
    console.error("Modal de pesquisa não encontrado.");
    return;
  }

  // Preenche informações do paciente
  document.getElementById("infoPacienteName").textContent = paciente.nome;
  document.getElementById("infoPacienteCPF").textContent = paciente.cpf || "-";
  document.getElementById("infoPacienteTelefone").textContent = paciente.telefone || "-";
  document.getElementById("infoPacienteEmail").textContent = paciente.email || "-";

  // Preenche tabela de consultas
  const tbody = document.querySelector("#tabelaPesquisaConsultas tbody");
  tbody.innerHTML = "";

  if (!Array.isArray(consultas) || consultas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">Nenhuma consulta encontrada para este paciente.</td></tr>`;
    modal.style.display = "flex";
    return;
  }

  consultas.forEach(c => {
    const tr = document.createElement("tr");
    const nomeMedico = c?.medico?.nome || "—";
    const dataConsulta = c?.dataConsulta || "—";
    const horaConsulta = c?.horaConsulta || "—";
    const status = c?.status || "—";
    const idConsulta = c?.id;

    tr.innerHTML = `
      <td>${nomeMedico}</td>
      <td>${dataConsulta}</td>
      <td>${horaConsulta}</td>
      <td>${status}</td>
      <td>
        <button class="btn btn-primary btn-small" onclick="verProntuarioPesquisa(${idConsulta})">
          Ver Prontuário
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  modal.style.display = "flex";
}

async function verProntuarioPesquisa(idConsulta) {
  try {
    const resp = await fetch(`http://localhost:8080/prontuarios/consulta/${idConsulta}`);

    let prontuario = null;
    if (resp.ok) {
      prontuario = await resp.json();
    }

    mostrarProntuarioPesquisa(prontuario, idConsulta);
  } catch (erro) {
    console.error("Erro ao buscar prontuário:", erro);
    alert("Erro ao buscar prontuário.");
  }
}

function mostrarProntuarioPesquisa(prontuario, idConsulta) {
  const modal = document.getElementById("modalDetalheProntuarioBackdrop");
  if (!modal) {
    console.error("Modal de detalhe de prontuário não encontrado.");
    return;
  }

  if (!prontuario) {
    document.getElementById("detalheSintomas").textContent = "Nenhum prontuário registrado";
    document.getElementById("detalheDuracao").textContent = "-";
    document.getElementById("detalheHistorico").textContent = "-";
    document.getElementById("detalheDiagnostico").textContent = "-";
    document.getElementById("detalhePrescricao").textContent = "-";
    document.getElementById("detalheObservacoes").textContent = "-";
  } else {
    document.getElementById("detalheSintomas").textContent = prontuario.sintomas || "-";
    document.getElementById("detalheDuracao").textContent = prontuario.duracaoSintomas || "-";
    document.getElementById("detalheHistorico").textContent = prontuario.historico || "-";
    document.getElementById("detalheDiagnostico").textContent = prontuario.diagnostico || "-";
    document.getElementById("detalhePrescricao").textContent = prontuario.prescricao || "-";
    document.getElementById("detalheObservacoes").textContent = prontuario.observacoes || "-";
  }

  modal.style.display = "flex";
}

function fecharModalPesquisa() {
  const modal = document.getElementById("modalPesquisaBackdrop");
  if (modal) modal.style.display = "none";
}

function fecharModalDetalheProntuario() {
  const modal = document.getElementById("modalDetalheProntuarioBackdrop");
  if (modal) modal.style.display = "none";
}

// ===================== INIT & POLLING ===================== //
let pollingHandle = null;
window.onload = () => {
  const nomeMedico = localStorage.getItem("nomeMedico") || (() => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
      return usuario?.nome || usuario?.medico?.nome || "";
    } catch (e) { return ""; }
  })();

  if (nomeMedico && document.getElementById("medicoNome")) {
    document.getElementById("medicoNome").textContent = `Olá, ${nomeMedico}`;
  }

  carregarConsultas();
  carregarDisponibilidades();

  if (pollingHandle) clearInterval(pollingHandle);
  pollingHandle = setInterval(() => {
    carregarConsultas();
    carregarDisponibilidades();
  }, 10000);
};

window.onclick = function (event) {
  const modals = ["prontuarioBackdrop", "modalDisponibilidadeBackdrop", "modalPesquisaBackdrop", "modalDetalheProntuarioBackdrop"];
  modals.forEach(id => {
    const modal = document.getElementById(id);
    if (event.target === modal) modal.style.display = "none";
  });
};