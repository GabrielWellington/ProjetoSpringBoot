package com.trabalho.agenda.controller;

import com.trabalho.agenda.model.Disponibilidade;
import com.trabalho.agenda.model.Medico;
import com.trabalho.agenda.repository.ConsultaRepository;
import com.trabalho.agenda.repository.DisponibilidadeRepository;
import com.trabalho.agenda.repository.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/disponibilidades")
@CrossOrigin(origins = "*")
public class DisponibilidadeController {

    @Autowired
    private DisponibilidadeRepository disponibilidadeRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    // 🔹 1. Listar disponibilidades de um médico específico
    @GetMapping("/medico/{idMedico}")
    public List<Disponibilidade> listarPorMedico(@PathVariable Long idMedico) {
        return disponibilidadeRepository.findByMedicoIdMedico(idMedico);
    }

    // 🔹 2. Criar nova disponibilidade
    @PostMapping("/adicionar/{idMedico}")
    public Disponibilidade adicionarDisponibilidade(@PathVariable Long idMedico,
                                                    @RequestBody Disponibilidade disponibilidade) {
        Medico medico = medicoRepository.findById(idMedico)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));
        disponibilidade.setMedico(medico);
        return disponibilidadeRepository.save(disponibilidade);
    }

    // 🔹 3. Editar uma disponibilidade existente
    @PutMapping("/editar/{idDisponibilidade}")
    public Disponibilidade editarDisponibilidade(@PathVariable Long idDisponibilidade,
                                                 @RequestBody Disponibilidade dadosAtualizados) {
        Disponibilidade disponibilidade = disponibilidadeRepository.findById(idDisponibilidade)
                .orElseThrow(() -> new RuntimeException("Disponibilidade não encontrada"));

        disponibilidade.setDiaSemana(dadosAtualizados.getDiaSemana());
        disponibilidade.setHoraInicio(dadosAtualizados.getHoraInicio());
        disponibilidade.setHoraFim(dadosAtualizados.getHoraFim());
        disponibilidade.setIntervaloMinutos(dadosAtualizados.getIntervaloMinutos());

        return disponibilidadeRepository.save(disponibilidade);
    }

    // 🔹 4. Excluir uma disponibilidade
    @DeleteMapping("/excluir/{idDisponibilidade}")
    public String excluirDisponibilidade(@PathVariable Long idDisponibilidade) {
        if (!disponibilidadeRepository.existsById(idDisponibilidade)) {
            return "Disponibilidade não encontrada";
        }
        disponibilidadeRepository.deleteById(idDisponibilidade);
        return "Disponibilidade removida com sucesso!";
    }

    // 🔹 5. NOVO — Listar horários livres por data real (ex: 2025-11-14)
    @GetMapping("/livres/{idMedico}/{data}")
    public List<String> listarHorariosLivres(@PathVariable Long idMedico,
                                             @PathVariable String data) {
        LocalDate dataConsulta = LocalDate.parse(data);
        DayOfWeek diaSemana = dataConsulta.getDayOfWeek();

        String nomeDia = switch (diaSemana) {
            case MONDAY -> "SEGUNDA";
            case TUESDAY -> "TERÇA";
            case WEDNESDAY -> "QUARTA";
            case THURSDAY -> "QUINTA";
            case FRIDAY -> "SEXTA";
            case SATURDAY -> "SÁBADO";
            case SUNDAY -> "DOMINGO";
        };

        List<Disponibilidade> dispList = disponibilidadeRepository.findByMedicoIdMedico(idMedico);
        List<String> horariosLivres = new ArrayList<>();

        for (Disponibilidade disp : dispList) {
            if (disp.getDiaSemana().equalsIgnoreCase(nomeDia)) {
                LocalTime inicio = LocalTime.parse(disp.getHoraInicio());
                LocalTime fim = LocalTime.parse(disp.getHoraFim());
                int intervalo = disp.getIntervaloMinutos();

                while (!inicio.isAfter(fim.minusMinutes(intervalo))) {
                    String hora = inicio.toString();
                    boolean ocupado = consultaRepository.existsByMedicoIdMedicoAndDataConsultaAndHoraConsulta(
                            idMedico, data, hora);
                    if (!ocupado) horariosLivres.add(hora);
                    inicio = inicio.plusMinutes(intervalo);
                }
            }
        }

        return horariosLivres;
    }
}
