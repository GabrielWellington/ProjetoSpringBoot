package com.trabalho.agenda.model;


import jakarta.persistence.*;

@Entity
@Table(name = "consultas")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dataConsulta;
    private String horaConsulta;
    private String diagnostico;
    private String observacoes;
    private boolean confirmada;
    private String tituloConsulta;
    private String descricaoTriagem;

    @ManyToOne
    @JoinColumn(name = "medico_id")
    private Medico medico;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @OneToOne(mappedBy = "consulta", cascade = CascadeType.ALL)
    private Prontuario prontuario;


    @Column(nullable = false)
    private String status = "PENDENTE";

    private String dataConfirmacao;

    public Consulta(){}

    public Consulta(String dataConsulta, String horaConsulta, String diagnostico, String observacoes, Medico medico, Paciente paciente, boolean confirmada){
        this.dataConsulta = dataConsulta;
        this.horaConsulta = horaConsulta;
        this.diagnostico = diagnostico;
        this.observacoes = observacoes;
        this.medico = medico;
        this.paciente = paciente;
        this.confirmada = confirmada;
    }

    public Long getId() {
        return id;
    }

    public String getDataConsulta() {
        return dataConsulta;
    }

    public void setDataConsulta(String dataConsulta) {
        this.dataConsulta = dataConsulta;
    }

    public String getHoraConsulta() {
        return horaConsulta;
    }

    public void setHoraConsulta(String horaConsulta) {
        this.horaConsulta = horaConsulta;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Prontuario getProntuario() {
        return prontuario;
    }

    public void setProntuario(Prontuario prontuario) {
        this.prontuario = prontuario;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDataConfirmacao() {
        return dataConfirmacao;
    }

    public void setDataConfirmacao(String dataConfirmacao) {
        this.dataConfirmacao = dataConfirmacao;
    }

    public boolean isConfirmada() {
        return confirmada;
    }

    public void setConfirmada(boolean confirmada) {
        this.confirmada = confirmada;
    }

    public String getTituloConsulta() {
        return tituloConsulta;
    }

    public void setTituloConsulta(String tituloConsulta) {
        this.tituloConsulta = tituloConsulta;
    }

    public String getDescricaoTriagem() {
        return descricaoTriagem;
    }

    public void setDescricaoTriagem(String descricaoTriagem) {
        this.descricaoTriagem = descricaoTriagem;
    }
}
