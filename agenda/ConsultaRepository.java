package com.trabalho.agenda.repository;

import com.trabalho.agenda.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    List<Consulta> findByMedicoIdMedico(Long idMedico);
    List<Consulta> findByPacienteEmail(String email);
    List<Consulta> findByMedicoEmail(String email);
    List<Consulta> findByPacienteIdPaciente(Long idPaciente);
    List<Consulta> findByStatus(String status);
    List<Consulta> findByConfirmadaTrue();

    boolean existsByMedicoIdMedicoAndDataConsultaAndHoraConsulta(
            Long idMedico, String dataConsulta, String horaConsulta);
}
