package com.br.unifor.simulador.adaptadores.web;

import com.br.unifor.simulador.aplicacao.pilha.PilhaEntrada;
import com.br.unifor.simulador.aplicacao.pilha.SimularAutomatoPilha;
import com.br.unifor.simulador.dominio.pilha.PilhaResultado;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pilha")
public class PilhaController {

    private final SimularAutomatoPilha casoDeUso;

    public PilhaController(SimularAutomatoPilha casoDeUso) {
        this.casoDeUso = casoDeUso;
    }

    @PostMapping("/simular")
    public ResponseEntity<PilhaResultado> simular(@RequestBody PilhaEntrada pedido) {
        PilhaResultado resultado = casoDeUso.executar(pedido);
        if ("erro".equals(resultado.tipo())) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
