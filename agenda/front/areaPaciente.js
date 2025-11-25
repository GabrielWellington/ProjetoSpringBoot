document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const idPaciente = usuario?.idPaciente;
  const tabelaConsultas = document.getElementById("tabelaConsultas");
  const selectMedico = document.getElementById("medico");
  const selectHorario = document.getElementById("horarioDisponivel");
  const formAgendar = document.getElementById("form-agendar");

  if (!usuario || !idPaciente) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "/";
    return;
  }

  async function carregarMedicos() {
    try {
      const res = await fetch("http://localhost:8080/medicos");
      if (!res.ok) throw new Error("Erro ao carregar médicos");
      const medicos = await res.json();

      selectMedico.innerHTML = `<option value="">Selecione um médico</option>`;
     medicos.forEach(medico => {
         const option = document.createElement("option");
         option.value = medico.idMedico;

         const nomeEspecialidade =
             medico.especialidade && medico.especialidade.nome
                 ? medico.especialidade.nome
                 : "Sem especialidade";

         option.textContent = `${medico.nome} — ${nomeEspecialidade}`;
         selectMedico.appendChild(option);
     });

    } catch (err) {
      console.error("Erro ao carregar médicos:", err);
      alert("Não foi possível carregar médicos.");
    }
  }

  selectMedico.addEventListener("change", async () => {
    const idMedico = selectMedico.value;
    selectHorario.innerHTML = `<option value="">Carregando...</option>`;

    if (!idMedico) {
      selectHorario.innerHTML = `<option value="">Selecione um médico primeiro</option>`;
      return;
    }

    try {
      const resp = await fetch(`http://localhost:8080/disponibilidades/medico/${idMedico}`);
      if (!resp.ok) throw new Error("Erro ao buscar disponibilidades");
      const disponibilidades = await resp.json();

      const agrupado = {};
      disponibilidades.forEach(d => {
        const dia = normalizeDia(d.diaSemana);
        const horarios = gerarSlots(d.horaInicio, d.horaFim, d.intervaloMinutos);
        if (!agrupado[dia]) agrupado[dia] = new Set();
        horarios.forEach(h => agrupado[dia].add(h));
      });

      selectHorario.innerHTML = `<option value="">Selecione um horário</option>`;

      const diasOrdem = ["SEGUNDA","TERCA","QUARTA","QUINTA","SEXTA","SABADO","DOMINGO"];
      diasOrdem.forEach(dia => {
        if (!agrupado[dia] || agrupado[dia].size === 0) return;
        const optg = document.createElement("optgroup");
        optg.label = formatDiaDisplay(dia);
        const times = Array.from(agrupado[dia]).sort((a,b)=>timeToMinutes(a)-timeToMinutes(b));
        times.forEach(t => {
          const opt = document.createElement("option");
          opt.value = `${dia}|${t}`; // exemplo: "SEGUNDA|08:30"
          opt.textContent = t;
          optg.appendChild(opt);
        });
        selectHorario.appendChild(optg);
      });

      if (selectHorario.options.length <= 1) selectHorario.innerHTML = `<option value="">Sem horários disponíveis</option>`;
    } catch (err) {
      console.error("Erro ao carregar disponibilidades:", err);
      selectHorario.innerHTML = `<option value="">Erro ao carregar horários</option>`;
    }
  });

  async function carregarConsultas() {
    try {
      const resp = await fetch(`http://localhost:8080/consultas/paciente/${idPaciente}`);
      if (!resp.ok) throw new Error("Erro ao carregar consultas");
      const consultas = await resp.json();
      tabelaConsultas.innerHTML = "";
      if (!consultas || consultas.length === 0) {
        tabelaConsultas.innerHTML = `<tr><td colspan="4">Nenhuma consulta agendada.</td></tr>`;
        return;
      }
      consultas.forEach(c => {
        const tr = document.createElement("tr");
        const statusClass =
          c.status === "CONFIRMADA" ? "confirmada" :
          c.status === "CANCELADA" ? "cancelada" : "pendente";
        tr.innerHTML = `
          <td>${c.medico?.nome || "—"}</td>
          <td>${c.dataConsulta || "—"}</td>
          <td>${c.horaConsulta || "—"}</td>
          <td><span class="status ${statusClass}">${c.status}</span></td>
        `;
        tabelaConsultas.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
    }
  }

  formAgendar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idMedicoRaw = selectMedico.value;
    const idMedico = Number(idMedicoRaw); // importante: envia número
    const horarioVal = selectHorario.value;
    const titulo = document.getElementById("tituloConsulta").value.trim();
    const descricao = document.getElementById("descricaoConsulta").value.trim();

    if (!idMedico || !horarioVal) {
      alert("Selecione médico e horário disponível.");
      return;
    }

    const [diaSemana, horaConsulta] = horarioVal.split("|");
    const dataConsulta = gerarProximaData(diaSemana);

    const consulta = {
      dataConsulta,
      horaConsulta,
      tituloConsulta: titulo || "Consulta",
      descricaoTriagem: descricao || "",
      paciente: { idPaciente },
      medico: { idMedico } // agora idMedico é número
    };

    try {
      const response = await fetch("http://localhost:8080/consultas/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consulta)
      });

      if (!response.ok) {
        // mostra mensagem de erro do servidor (útil pra debug)
        const txt = await response.text();
        throw new Error(txt || "Erro ao agendar consulta");
      }

      alert("Consulta agendada com sucesso!");
      formAgendar.reset();
      selectHorario.innerHTML = `<option value="">Selecione um horário</option>`;
      await carregarConsultas();
    } catch (err) {
      console.error("Erro ao agendar consulta:", err);
      // tenta extrair mensagem legível (se for JSON com "message")
      try {
        const parsed = JSON.parse(err.message);
        alert(parsed.message || parsed.error || "Erro ao agendar consulta");
      } catch (_) {
        alert(err.message);
      }
    }
  });

  // helpers (mesmos que você já usava)
  function gerarSlots(inicio, fim, intervalo) {
    const slots = [];
    let min = timeToMinutes(inicio);
    const fimMin = timeToMinutes(fim);
    while (min < fimMin) {
      slots.push(minutesToTime(min));
      min += Number(intervalo) || 30;
    }
    return slots;
  }
  function timeToMinutes(t) { const [h,m]=t.split(":").map(Number); return h*60 + (m||0); }
  function minutesToTime(m) { const hh=String(Math.floor(m/60)).padStart(2,"0"); const mm=String(m%60).padStart(2,"0"); return `${hh}:${mm}`; }

  function normalizeDia(d) {
    if(!d) return "";
    const map = {
      "MONDAY":"SEGUNDA","TUESDAY":"TERCA","WEDNESDAY":"QUARTA","THURSDAY":"QUINTA","FRIDAY":"SEXTA","SATURDAY":"SABADO","SUNDAY":"DOMINGO",
      "SEGUNDA":"SEGUNDA","TERCA":"TERCA","TERÇA":"TERCA","QUARTA":"QUARTA","QUINTA":"QUINTA","SEXTA":"SEXTA","SABADO":"SABADO","SÁBADO":"SABADO","DOMINGO":"DOMINGO"
    };
    return map[d.toUpperCase()] || d.toUpperCase();
  }
  function formatDiaDisplay(d) {
    const map = { "SEGUNDA":"Segunda","TERCA":"Terça","QUARTA":"Quarta","QUINTA":"Quinta","SEXTA":"Sexta","SABADO":"Sábado","DOMINGO":"Domingo" };
    return map[d] || d;
  }
  function gerarProximaData(dia) {
    const map = { "DOMINGO":0,"SEGUNDA":1,"TERCA":2,"QUARTA":3,"QUINTA":4,"SEXTA":5,"SABADO":6 };
    const alvo = map[dia] ?? 1;
    const hoje = new Date();
    let diff = alvo - hoje.getDay();
    if (diff <= 0) diff += 7;
    const alvoData = new Date(hoje);
    alvoData.setDate(hoje.getDate() + diff);
    return alvoData.toISOString().split("T")[0];
  }

  await carregarMedicos();
  await carregarConsultas();
});
