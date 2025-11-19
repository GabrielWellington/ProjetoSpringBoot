package com.trabalho.agenda.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(){
        return "login";
    }

    @GetMapping("/login")
    public String loginPage(){
        return "login";
    }

    @GetMapping("/areaUsuario")
    public String areaUsuario(){
        return "areaUsuario";
    }

    @GetMapping("/areaMedico")
    public String areaMedico(){
        return "areaMedico";
    }

    @GetMapping("/areaPaciente")
    public String areaPaciente(){
        return "areaPaciente";
    }

}
