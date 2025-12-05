package com.trabalho.agenda.repository;

import com.trabalho.agenda.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {
    Optional<Medico> findByNome(String nome);
    Optional<Medico> findByEmail(String email);
}
