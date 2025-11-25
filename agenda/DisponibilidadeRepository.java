package com.trabalho.agenda.repository;

import com.trabalho.agenda.model.Disponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisponibilidadeRepository extends JpaRepository<Disponibilidade, Long> {
    List<Disponibilidade> findByMedicoIdMedico(Long idMedico);
}
