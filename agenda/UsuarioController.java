package com.trabalho.agenda.controller;

import com.trabalho.agenda.model.Usuario;
import com.trabalho.agenda.model.Paciente;
import com.trabalho.agenda.model.Medico;
import com.trabalho.agenda.model.Recepcionista;
import com.trabalho.agenda.repository.PacienteRepository;
import com.trabalho.agenda.repository.MedicoRepository;
import com.trabalho.agenda.repository.RecepcionistaRepository;
import com.trabalho.agenda.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final RecepcionistaRepository recepcionistaRepository;

    public UsuarioController(
            UsuarioService usuarioService,
            PacienteRepository pacienteRepository,
            MedicoRepository medicoRepository,
            RecepcionistaRepository recepcionistaRepository
    ) {
        this.usuarioService = usuarioService;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.recepcionistaRepository = recepcionistaRepository;
    }

    // ==================== CRUD BÁSICO ==================== //
    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(id);
        return usuarioOpt
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<Usuario> salvar(@RequestBody Usuario usuario) {
        Usuario salvo = usuarioService.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== LOGIN ==================== //
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Usuario loginData) {
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmailESenha(loginData.getEmail(), loginData.getSenha());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Email ou senha incorretos"));
        }

        Usuario usuario = usuarioOpt.get();
        Map<String, Object> resposta = new HashMap<>();

        resposta.put("id", usuario.getId());
        resposta.put("nome", usuario.getNome());
        resposta.put("email", usuario.getEmail());
        resposta.put("tipo", usuario.getTipo());

        // 🔹 Retorna também o ID vinculado conforme o tipo de usuário
        String tipo = usuario.getTipo() != null ? usuario.getTipo().toLowerCase() : "";

        switch (tipo) {
            case "paciente" -> pacienteRepository.findByEmail(usuario.getEmail())
                    .ifPresent(p -> resposta.put("idPaciente", p.getIdPaciente()));

            case "medico" -> medicoRepository.findByEmail(usuario.getEmail())
                    .ifPresent(m -> resposta.put("idMedico", m.getIdMedico()));

            case "recepcionista" -> recepcionistaRepository.findByEmail(usuario.getEmail())
                    .ifPresent(r -> resposta.put("idRecepcionista", r.getIdRecepcionista()));
        }

        return ResponseEntity.ok(resposta);
    }

    // ==================== CADASTRO ==================== //
    @PostMapping("/cadastro")
    public ResponseEntity<Usuario> cadastrar(@RequestBody Usuario usuario) {
        Usuario novo = usuarioService.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novo);
    }
}
