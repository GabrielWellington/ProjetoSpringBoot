package com.trabalho.agenda.controller;


import com.trabalho.agenda.model.Medico;
import com.trabalho.agenda.service.MedicoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/medicos")
@CrossOrigin(origins = "http://localhost:8080")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService){
        this.medicoService = medicoService;
    }

    @GetMapping
    public List<Medico> listarTodos(){
        return medicoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Optional<Medico> buscarPorId(@PathVariable Long id){
        return medicoService.buscarPorId(id);
    }

    @PostMapping
    public Medico salvar(@RequestBody Medico medico){
        return medicoService.salvar(medico);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id){
        medicoService.deletar(id);
    }
}
