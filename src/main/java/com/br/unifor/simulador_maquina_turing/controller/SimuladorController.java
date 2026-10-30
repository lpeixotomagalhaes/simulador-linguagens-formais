package com.br.unifor.simulador_maquina_turing.controller;

import com.br.unifor.simulador_maquina_turing.ResultadoSimulacao;
import com.br.unifor.simulador_maquina_turing.dto.SimulacaoRequest;
import com.br.unifor.simulador_maquina_turing.service.SimuladorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SimuladorController {

    private final SimuladorService simuladorService;

    public SimuladorController(SimuladorService simuladorService) {
        this.simuladorService = simuladorService;
    }

    @PostMapping("/simular")
    public ResponseEntity<ResultadoSimulacao> simular(@RequestBody SimulacaoRequest pedido) {
        ResultadoSimulacao resultado = simuladorService.simular(pedido);
        if ("erro".equals(resultado.tipo())) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
