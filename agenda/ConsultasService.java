package com.trabalho.agenda.service;


import com.trabalho.agenda.model.Consulta;
import com.trabalho.agenda.repository.ConsultaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConsultasService {

    private final ConsultaRepository consultaRepository;

    public ConsultasService(ConsultaRepository consultaRepository){
        this.consultaRepository = consultaRepository;
    }

    public List<Consulta> listarTodas(){
        return consultaRepository.findAll();
    }

    public Optional<Consulta> buscarPorId(Long id){
        return consultaRepository.findById(id);
    }

    public Consulta salvar(Consulta consulta){
        return consultaRepository.save(consulta);
    }

    public void deletar(Long id){
        consultaRepository.deleteById(id);
    }

    public List<Consulta> listarPorMedico(Long idMedico){
        return consultaRepository.findByMedicoIdMedico(idMedico);
    }

    public List<Consulta> listarConfirmadas() {
        return consultaRepository.findByConfirmadaTrue();
    }

}
