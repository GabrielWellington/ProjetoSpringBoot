package com.trabalho.agenda.controller;

import com.trabalho.agenda.model.Consulta;
import com.trabalho.agenda.model.Disponibilidade;
import com.trabalho.agenda.model.Medico;
import com.trabalho.agenda.model.Paciente;
import com.trabalho.agenda.repository.ConsultaRepository;
import com.trabalho.agenda.repository.DisponibilidadeRepository;
import com.trabalho.agenda.repository.MedicoRepository;
import com.trabalho.agenda.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/consultas")
@CrossOrigin(origins = "*")
public class ConsultaController {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private DisponibilidadeRepository disponibilidadeRepository;

    // 🔹 Listar consultas por paciente
    @GetMapping("/paciente/{idPaciente}")
    public List<Consulta> listarPorPaciente(@PathVariable Long idPaciente) {
        return consultaRepository.findByPacienteIdPaciente(idPaciente);
    }

    // 🔹 Listar consultas por médico
    @GetMapping("/medico/{idMedico}")
    public List<Consulta> listarPorMedico(@PathVariable Long idMedico) {
        return consultaRepository.findByMedicoIdMedico(idMedico);
    }

    // 🔹 Listar consultas pendentes (para recepcionista)
    @GetMapping("/pendentes")
    public List<Consulta> listarPendentes() {
        return consultaRepository.findByStatus("PENDENTE");
    }

    // 🔹 Agendar nova consulta (Paciente)
    @PostMapping("/agendar")
    public Consulta agendarConsulta(@RequestBody Consulta consulta) {
        Medico medico = medicoRepository.findById(consulta.getMedico().getIdMedico())
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));
        Paciente paciente = pacienteRepository.findById(consulta.getPaciente().getIdPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        consulta.setMedico(medico);
        consulta.setPaciente(paciente);
        consulta.setDiagnostico("Aguardando atendimento");
        consulta.setStatus("PENDENTE");

        if (consulta.getDataConsulta() == null || consulta.getHoraConsulta() == null ||
                consulta.getDataConsulta().isEmpty() || consulta.getHoraConsulta().isEmpty()) {
            throw new RuntimeException("Data e hora da consulta devem ser informadas!");
        }

        // 🔹 Validação de horário com base nas disponibilidades do médico
        List<com.trabalho.agenda.model.Disponibilidade> disponibilidades =
                disponibilidadeRepository.findByMedicoIdMedico(medico.getIdMedico());
        if (disponibilidades.isEmpty()) {
            throw new RuntimeException("O médico não possui horários cadastrados.");
        }

// converte dataCliente string -> LocalDate
        java.time.LocalDate dataConsulta = java.time.LocalDate.parse(consulta.getDataConsulta());
        java.time.DayOfWeek diaConsultaEnum = dataConsulta.getDayOfWeek(); // MONDAY, TUESDAY, ...

// função auxiliar: tenta mapear uma string (pt ou en) para DayOfWeek
        java.util.function.Function<String, java.time.DayOfWeek> toDayOfWeek = (s) -> {
            if (s == null) return null;
            String up = s.trim().toUpperCase();
            // mapeia PT -> EN
            switch (up) {
                case "SEGUNDA": case "TERCA": case "TERÇA": case "QUARTA": case "QUINTA": case "SEXTA": case "SABADO": case "SÁBADO": case "DOMINGO":
                    // fallback: map manual
                    if (up.startsWith("SEG")) return java.time.DayOfWeek.MONDAY;
                    if (up.startsWith("TER")) return java.time.DayOfWeek.TUESDAY;
                    if (up.startsWith("QUA")) return java.time.DayOfWeek.WEDNESDAY;
                    if (up.startsWith("QUI")) return java.time.DayOfWeek.THURSDAY;
                    if (up.startsWith("SEX")) return java.time.DayOfWeek.FRIDAY;
                    if (up.startsWith("SAB")) return java.time.DayOfWeek.SATURDAY;
                    if (up.startsWith("DOM")) return java.time.DayOfWeek.SUNDAY;
            }
            // tenta valor direto (MONDAY, TUESDAY, etc.)
            try {
                return java.time.DayOfWeek.valueOf(up);
            } catch (Exception ex) {
                return null;
            }
        };

        int horaConsultaMin;
        try {
            String[] partesHora = consulta.getHoraConsulta().split(":");
            horaConsultaMin = Integer.parseInt(partesHora[0]) * 60 + Integer.parseInt(partesHora[1]);
        } catch (Exception ex) {
            throw new RuntimeException("Formato de hora inválido (esperado HH:mm).");
        }

        boolean horarioValido = false;

        for (com.trabalho.agenda.model.Disponibilidade disp : disponibilidades) {
            java.time.DayOfWeek dispDia = toDayOfWeek.apply(disp.getDiaSemana());
            if (dispDia == null) continue;

            if (dispDia.equals(diaConsultaEnum)) {
                int inicio = Integer.parseInt(disp.getHoraInicio().split(":")[0]) * 60
                        + Integer.parseInt(disp.getHoraInicio().split(":")[1]);
                int fim = Integer.parseInt(disp.getHoraFim().split(":")[0]) * 60
                        + Integer.parseInt(disp.getHoraFim().split(":")[1]);

                if (horaConsultaMin >= inicio && horaConsultaMin < fim) {
                    int diferenca = horaConsultaMin - inicio;
                    int intervalo = disp.getIntervaloMinutos() <= 0 ? 30 : disp.getIntervaloMinutos();
                    if (diferenca % intervalo == 0) {
                        // adicional: verificar se já não existe outra consulta confirmada/pendente no mesmo dia/hora
                        boolean ocupado = consultaRepository.findByMedicoIdMedico(disp.getMedico().getIdMedico())
                                .stream()
                                .anyMatch(c ->
                                        c.getDataConsulta() != null && c.getHoraConsulta() != null &&
                                                c.getDataConsulta().equals(consulta.getDataConsulta()) &&
                                                c.getHoraConsulta().equals(consulta.getHoraConsulta()) &&
                                                !c.getStatus().equalsIgnoreCase("CANCELADA")
                                );
                        if (!ocupado) {
                            horarioValido = true;
                            break;
                        } else {
                            throw new RuntimeException("Horário já ocupado para este médico.");
                        }
                    }
                }
            }
        }

        if (!horarioValido) {
            throw new RuntimeException("Horário inválido para este médico! Escolha um horário conforme a disponibilidade.");
        }


        return consultaRepository.save(consulta);
    }

    // 🔹 Confirmar consulta (por recepcionista)
    @PutMapping("/confirmar/{idConsulta}")
    public Consulta confirmarConsulta(@PathVariable Long idConsulta) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        consulta.setStatus("CONFIRMADA");
        consulta.setDataConfirmacao(LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        return consultaRepository.save(consulta);
    }

    // 🔹 Cancelar consulta
    @PutMapping("/cancelar/{idConsulta}")
    public Consulta cancelarConsulta(@PathVariable Long idConsulta) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        consulta.setStatus("CANCELADA");
        return consultaRepository.save(consulta);
    }

    // 🔹 Marcar como atendida
    @PutMapping("/atender/{idConsulta}")
    public Consulta atenderConsulta(@PathVariable Long idConsulta) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        consulta.setStatus("ATENDIDA");
        return consultaRepository.save(consulta);
    }

    // 🔹 Listar consultas confirmadas
    @GetMapping("/confirmadas")
    public List<Consulta> listarConfirmadas() {
        return consultaRepository.findByStatus("CONFIRMADA");
    }

    // 🔹 Listar disponibilidades de um médico
    @GetMapping("/disponibilidades/{idMedico}")
    public List<Disponibilidade> listarDisponibilidades(@PathVariable Long idMedico) {
        return disponibilidadeRepository.findByMedicoIdMedico(idMedico);
    }

    // 🔹 NOVO: Listar horários disponíveis organizados por dia da semana
    @GetMapping("/horarios/{idMedico}")
    public Map<String, List<String>> listarHorariosPorDia(@PathVariable Long idMedico) {
        List<Disponibilidade> disponibilidades = disponibilidadeRepository.findByMedicoIdMedico(idMedico);
        Map<String, List<String>> horariosPorDia = new LinkedHashMap<>();

        for (Disponibilidade disp : disponibilidades) {
            List<String> horarios = new ArrayList<>();
            int inicio = Integer.parseInt(disp.getHoraInicio().split(":")[0]) * 60
                    + Integer.parseInt(disp.getHoraInicio().split(":")[1]);
            int fim = Integer.parseInt(disp.getHoraFim().split(":")[0]) * 60
                    + Integer.parseInt(disp.getHoraFim().split(":")[1]);

            for (int i = inicio; i < fim; i += disp.getIntervaloMinutos()) {
                int hora = i / 60;
                int minuto = i % 60;
                String horarioFormatado = String.format("%02d:%02d", hora, minuto);
                horarios.add(horarioFormatado);
            }

            String diaFormatado = switch (disp.getDiaSemana().toUpperCase()) {
                case "MONDAY" -> "Segunda-feira";
                case "TUESDAY" -> "Terça-feira";
                case "WEDNESDAY" -> "Quarta-feira";
                case "THURSDAY" -> "Quinta-feira";
                case "FRIDAY" -> "Sexta-feira";
                case "SATURDAY" -> "Sábado";
                case "SUNDAY" -> "Domingo";
                default -> disp.getDiaSemana();
            };

            horariosPorDia.put(diaFormatado, horarios);
        }

        return horariosPorDia;
    }
    // Adicione este método ao ConsultaController.java

    // 🔹 Deletar consulta (apenas se atendida ou cancelada)
    @DeleteMapping("/{idConsulta}")
    public ResponseEntity<String> deletarConsulta(@PathVariable Long idConsulta) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        // Permite deletar apenas consultas atendidas ou canceladas
        if (!consulta.getStatus().equalsIgnoreCase("ATENDIDA") &&
                !consulta.getStatus().equalsIgnoreCase("CANCELADA")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Apenas consultas atendidas ou canceladas podem ser removidas.");
        }

        consultaRepository.deleteById(idConsulta);
        return ResponseEntity.ok("Consulta removida com sucesso!");
    }
}
