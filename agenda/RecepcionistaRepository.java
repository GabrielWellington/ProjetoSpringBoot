package com.trabalho.agenda.repository;


import com.trabalho.agenda.model.Recepcionista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecepcionistaRepository extends JpaRepository<Recepcionista, Long> {
    Optional<Recepcionista> findByEmail(String email);
}
