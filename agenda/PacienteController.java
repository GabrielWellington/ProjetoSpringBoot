package com.trabalho.agenda.controller;


import com.trabalho.agenda.model.Paciente;
import com.trabalho.agenda.service.PacienteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteService pacienteService;

    public PacienteController(PacienteService pacienteService){
        this.pacienteService = pacienteService;
    }

    @GetMapping
    public List<Paciente> listarTodos(){
        return pacienteService.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<Paciente> buscarPorId(@PathVariable Long id){
        return pacienteService.buscarPorId(id);
    }

    @PostMapping
    public Paciente salvar(@RequestBody Paciente paciente){
        return pacienteService.salvar(paciente);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id){
        pacienteService.deletar(id);
    }
}
