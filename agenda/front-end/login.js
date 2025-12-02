document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const response = await fetch("http://localhost:8080/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      if (!response.ok) {
        // tenta ler mensagem de erro do back (se houver)
        let texto = "Email ou senha incorretos!";
        try {
          const err = await response.json();
          if (err && err.erro) texto = err.erro;
        } catch (_) {}
        throw new Error(texto);
      }

      const usuario = await response.json();
      console.log("Usuário logado:", usuario);

      // salva o objeto completo (útil para recuperar depois)
      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

      // salva o nome (se houver)
      const nome = usuario.nome || usuario.medico?.nome || usuario.nomeMedico || "";
      if (nome) localStorage.setItem("nomeMedico", nome);

      // tenta extrair idMedico em várias formas (compatível com diferentes backends)
      let idMedico = null;

      if (usuario.idMedico) idMedico = usuario.idMedico;
      else if (usuario.medico && usuario.medico.idMedico) idMedico = usuario.medico.idMedico;
      else if (usuario.id) {
        // às vezes o id do Medico vem como id no próprio objeto (menos comum)
        // então tentamos ver se o usuário é médico pelo tipo e usar id
        if ((usuario.tipo || "").toLowerCase() === "medico") idMedico = usuario.id;
      }

      // se conseguiu extrair um id, salva no localStorage (sempre como string)
      if (idMedico !== null && idMedico !== undefined) {
        localStorage.setItem("idMedico", String(idMedico));
      } else {
        // remove caso não seja médico ou não tenha id
        localStorage.removeItem("idMedico");
      }

      // redirecionamento baseado no tipo
      const tipo = (usuario.tipo || "").toLowerCase();

      if (tipo === "medico") {
        window.location.href = "/areaMedico";
      } else if (tipo === "paciente") {
        window.location.href = "/areaPaciente";
      } else if (tipo === "recepcionista") {
        window.location.href = "/areaRecepcionista";
      } else if (tipo === "usuario") {
        window.location.href = "/areaUsuario";
      } else {
        // tipo desconhecido: tenta página padrão
        window.location.href = "/";
      }

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert(error.message || "Erro desconhecido no login.");
    }
  });
});
