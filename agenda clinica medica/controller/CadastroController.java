package com.trabalho.agenda.controller;

import com.trabalho.agenda.model.Medico;
import com.trabalho.agenda.model.Recepcionista;
import com.trabalho.agenda.model.Usuario;
import com.trabalho.agenda.model.Paciente;
import com.trabalho.agenda.model.Especialidade;
import com.trabalho.agenda.repository.MedicoRepository;
import com.trabalho.agenda.repository.PacienteRepository;
import com.trabalho.agenda.repository.RecepcionistaRepository;
import com.trabalho.agenda.repository.UsuarioRepository;
import com.trabalho.agenda.repository.EspecialidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class CadastroController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private RecepcionistaRepository recepcionistaRepository;

    @Autowired
    private EspecialidadeRepository especialidadeRepository;

    @GetMapping("/cadastro")
    public String mostrarFormulario(){
        return "cadastro";
    }

    @PostMapping("/cadastro")
    public String cadastrarUsuario(
            @RequestParam String nome,
            @RequestParam String email,
            @RequestParam String senha,
            @RequestParam String tipo,
            @RequestParam(required = false) String crm,
            @RequestParam(required = false) Long especialidadeId,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String telefone,
            @RequestParam(required = false) String endereco) {

        // salva usuário genérico
        Usuario usuario = new Usuario(nome, email, senha, tipo);
        usuarioRepository.save(usuario);

        // salva conforme o tipo
        if (tipo.equalsIgnoreCase("medico")) {

            Especialidade esp = null;
            if (especialidadeId != null) {
                esp = especialidadeRepository.findById(especialidadeId)
                        .orElseThrow(() -> new RuntimeException("Especialidade inválida"));
            }

            Medico medico = new Medico(nome, crm, (esp != null ? esp : null), telefone, email);
            medicoRepository.save(medico);

        } else if (tipo.equalsIgnoreCase("paciente")) {
            Paciente paciente = new Paciente(nome, cpf, telefone, email, endereco);
            pacienteRepository.save(paciente);
        } else if (tipo.equalsIgnoreCase("recepcionista")) {
            Recepcionista recepcionista = new Recepcionista(nome, cpf, telefone);
            recepcionistaRepository.save(recepcionista);
        }

        return "redirect:/login";
    }
}
