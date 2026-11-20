package com.br.unifor.simulador.adaptadores.web;

import com.br.unifor.simulador.aplicacao.linguagem.AnalisarLinguagem;
import com.br.unifor.simulador.aplicacao.linguagem.LinguagemEntrada;
import com.br.unifor.simulador.dominio.linguagem.LinguagemResultado;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LinguagemController {

    private final AnalisarLinguagem casoDeUso;

    public LinguagemController(AnalisarLinguagem casoDeUso) {
        this.casoDeUso = casoDeUso;
    }

    @PostMapping("/linguagem")
    public ResponseEntity<LinguagemResultado> analisar(@RequestBody LinguagemEntrada pedido) {
        LinguagemResultado resultado = casoDeUso.executar(pedido);
        if ("erro".equals(resultado.tipo())) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
