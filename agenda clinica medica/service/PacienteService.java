package com.trabalho.agenda.service;


import com.trabalho.agenda.model.Paciente;
import com.trabalho.agenda.repository.PacienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PacienteService {

    private  final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository){
        this.pacienteRepository = pacienteRepository;
    }

    public List<Paciente> listarTodos(){
        return pacienteRepository.findAll();
    }

    public Optional<Paciente> buscarPorId(Long id){
        return pacienteRepository.findById(id);
    }

    public Paciente salvar(Paciente paciente){
        return pacienteRepository.save(paciente);
    }

    public void deletar(Long id){
        pacienteRepository.deleteById(id);
    }
}
