package com.br.unifor.simulador.adaptadores.web;

import com.br.unifor.simulador.aplicacao.gramatica.DerivarCadeia;
import com.br.unifor.simulador.aplicacao.gramatica.GramaticaEntrada;
import com.br.unifor.simulador.dominio.gramatica.GramaticaResultado;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gramatica")
public class GramaticaController {

    private final DerivarCadeia casoDeUso;

    public GramaticaController(DerivarCadeia casoDeUso) {
        this.casoDeUso = casoDeUso;
    }

    @PostMapping("/derivar")
    public ResponseEntity<GramaticaResultado> derivar(@RequestBody GramaticaEntrada pedido) {
        GramaticaResultado resultado = casoDeUso.executar(pedido);
        if ("erro".equals(resultado.tipo())) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
