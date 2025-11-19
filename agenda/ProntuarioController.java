package com.trabalho.agenda.controller;

import com.trabalho.agenda.model.Consulta;
import com.trabalho.agenda.model.Prontuario;
import com.trabalho.agenda.repository.ConsultaRepository;
import com.trabalho.agenda.repository.ProntuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/prontuarios")
@CrossOrigin(origins = "*")
public class ProntuarioController {

    @Autowired
    private ProntuarioRepository prontuarioRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    // Criar prontuário vinculado à consulta
    @PostMapping("/salvar/{idConsulta}")
    public Prontuario salvarProntuario(@PathVariable Long idConsulta, @RequestBody Prontuario prontuario) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        prontuario.setConsulta(consulta);
        consulta.setStatus("ATENDIDA");

        consultaRepository.save(consulta);
        return prontuarioRepository.save(prontuario);
    }

    // Visualizar prontuário de uma consulta
    @GetMapping("/consulta/{idConsulta}")
    public Prontuario visualizarProntuario(@PathVariable Long idConsulta) {
        return prontuarioRepository.findByConsultaId(idConsulta);
    }
}
