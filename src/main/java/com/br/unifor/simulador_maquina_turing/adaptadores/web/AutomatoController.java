package com.br.unifor.simulador_maquina_turing.adaptadores.web;

import com.br.unifor.simulador_maquina_turing.aplicacao.automato.AutomatoEntrada;
import com.br.unifor.simulador_maquina_turing.aplicacao.automato.SimularAutomatoFinito;
import com.br.unifor.simulador_maquina_turing.dominio.automato.AutomatoResultado;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/automato")
public class AutomatoController {

    private final SimularAutomatoFinito casoDeUso;

    public AutomatoController(SimularAutomatoFinito casoDeUso) {
        this.casoDeUso = casoDeUso;
    }

    @PostMapping("/simular")
    public ResponseEntity<AutomatoResultado> simular(@RequestBody AutomatoEntrada pedido) {
        AutomatoResultado resultado = casoDeUso.executar(pedido);
        if ("erro".equals(resultado.tipo())) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
