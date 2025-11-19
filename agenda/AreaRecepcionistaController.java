package com.trabalho.agenda.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AreaRecepcionistaController {

    @GetMapping("/areaRecepcionista")
    public String areaRecepcionista() {
        return "areaRecepcionista"; // Vai procurar templates/areaRecepcionista.html
    }
}
