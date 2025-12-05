package com.trabalho.agenda.repository;


import com.trabalho.agenda.model.Prontuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProntuarioRepository extends JpaRepository<Prontuario, Long> {
    Prontuario findByConsultaId(Long idConsulta);
}
