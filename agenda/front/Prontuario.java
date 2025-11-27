package com.trabalho.agenda.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Prontuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProntuario;

    @OneToOne
    @JoinColumn(name = "consulta_id", unique = true)
    @JsonIgnore
    private Consulta consulta;

    private String sintomas;
    private String duracaoSintomas;
    private String historico;
    private String diagnostico;
    private String prescricao;
    @Column(length = 2000)
    private String observacoes;

    private LocalDateTime dataCriacao;

    public Long getIdProntuario() { return idProntuario; }
    public void setIdProntuario(Long idProntuario) { this.idProntuario = idProntuario; }

    public Consulta getConsulta() { return consulta; }
    public void setConsulta(Consulta consulta) { this.consulta = consulta; }

    public String getSintomas() { return sintomas; }
    public void setSintomas(String sintomas) { this.sintomas = sintomas; }

    public String getDuracaoSintomas() { return duracaoSintomas; }
    public void setDuracaoSintomas(String duracaoSintomas) { this.duracaoSintomas = duracaoSintomas; }

    public String getHistorico() { return historico; }
    public void setHistorico(String historico) { this.historico = historico; }

    public String getDiagnostico() { return diagnostico; }
    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }

    public String getPrescricao() { return prescricao; }
    public void setPrescricao(String prescricao) { this.prescricao = prescricao; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
