package com.trabalho.agenda.controller;

import com.trabalho.agenda.model.Especialidade;
import com.trabalho.agenda.repository.EspecialidadeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/especialidades")
@CrossOrigin(origins = "http://localhost:8080")
public class EspecialidadeController {

    private final EspecialidadeRepository repo;

    public EspecialidadeController(EspecialidadeRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Especialidade> listar() {
        return repo.findAll();
    }
}
