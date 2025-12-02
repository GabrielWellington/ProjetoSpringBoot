package com.trabalho.agenda.service;



import com.trabalho.agenda.model.Recepcionista;
import com.trabalho.agenda.repository.RecepcionistaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecepcionistaService {

    private  final RecepcionistaRepository recepcionistaRepository;

    public RecepcionistaService(RecepcionistaRepository recepcionistaRepository){
        this.recepcionistaRepository = recepcionistaRepository;
    }

    public List<Recepcionista> listarTodos(){
        return recepcionistaRepository.findAll();
    }

    public Optional<Recepcionista> buscarPorId(Long id){
        return recepcionistaRepository.findById(id);
    }

    public Recepcionista salvar(Recepcionista paciente){
        return recepcionistaRepository.save(paciente);
    }

    public void deletar(Long id){
        recepcionistaRepository.deleteById(id);
    }
}
