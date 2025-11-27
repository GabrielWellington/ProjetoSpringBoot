package com.trabalho.agenda.service;

import com.trabalho.agenda.model.Prontuario;
import com.trabalho.agenda.repository.ProntuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProntuarioService {

    private final ProntuarioRepository prontuarioRepository;

    public ProntuarioService(ProntuarioRepository prontuarioRepository){
        this.prontuarioRepository = prontuarioRepository;
    }

    public List<Prontuario> listarTodos(){
        return prontuarioRepository.findAll();
    }

    public Optional<Prontuario> buscarPorId(Long id){
        return prontuarioRepository.findById(id);
    }

    public Prontuario salvar(Prontuario prontuario){
        return prontuarioRepository.save(prontuario);
    }

    public void deletar(Long id){
        prontuarioRepository.deleteById(id);
    }
}
