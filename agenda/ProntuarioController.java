package com.trabalho.agenda.controller;

import com.trabalho.agenda.model.Consulta;
import com.trabalho.agenda.model.Prontuario;
import com.trabalho.agenda.repository.ConsultaRepository;
import com.trabalho.agenda.repository.ProntuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/prontuarios")
@CrossOrigin(origins = "*")
public class ProntuarioController {

    @Autowired
    private ProntuarioRepository prontuarioRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    // 🔹 SALVAR prontuário SEM marcar como atendida (permite edições)
    @PostMapping("/salvar/{idConsulta}")
    public Prontuario salvarProntuario(@PathVariable Long idConsulta, @RequestBody Prontuario prontuario) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        // Verifica se já existe prontuário para esta consulta
        Prontuario prontuarioExistente = prontuarioRepository.findByConsultaId(idConsulta);

        if (prontuarioExistente != null) {
            // Atualiza o prontuário existente
            prontuarioExistente.setSintomas(prontuario.getSintomas());
            prontuarioExistente.setDuracaoSintomas(prontuario.getDuracaoSintomas());
            prontuarioExistente.setHistorico(prontuario.getHistorico());
            prontuarioExistente.setDiagnostico(prontuario.getDiagnostico());
            prontuarioExistente.setPrescricao(prontuario.getPrescricao());
            prontuarioExistente.setObservacoes(prontuario.getObservacoes());
            return prontuarioRepository.save(prontuarioExistente);
        }

        // Cria novo prontuário
        prontuario.setConsulta(consulta);
        prontuario.setDataCriacao(LocalDateTime.now());
        return prontuarioRepository.save(prontuario);
    }

    // 🔹 MARCAR COMO ATENDIDA (finaliza o atendimento)
    @PutMapping("/marcarAtendida/{idConsulta}")
    public Prontuario marcarComoAtendida(@PathVariable Long idConsulta) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        // Verifica se existe prontuário
        Prontuario prontuario = prontuarioRepository.findByConsultaId(idConsulta);
        if (prontuario == null) {
            throw new RuntimeException("Não há prontuário salvo para esta consulta");
        }

        // Marca a consulta como ATENDIDA
        consulta.setStatus("ATENDIDA");
        consultaRepository.save(consulta);

        return prontuario;
    }

    // 🔹 Visualizar prontuário de uma consulta
    @GetMapping("/consulta/{idConsulta}")
    public Prontuario visualizarProntuario(@PathVariable Long idConsulta) {
        return prontuarioRepository.findByConsultaId(idConsulta);
    }
}