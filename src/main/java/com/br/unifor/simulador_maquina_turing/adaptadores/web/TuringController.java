package com.br.unifor.simulador_maquina_turing.adaptadores.web;

import com.br.unifor.simulador_maquina_turing.aplicacao.turing.SimularMaquinaTuring;
import com.br.unifor.simulador_maquina_turing.aplicacao.turing.TuringEntrada;
import com.br.unifor.simulador_maquina_turing.dominio.turing.ResultadoSimulacao;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Entrada HTTP que o programa do professor não tinha.
 *
 * A página faz POST /api/simular com o JSON do formulário. Se a configuração
 * for inválida, a resposta é 400 e o campo motivo explica o erro. Se a
 * máquina rodou, a resposta é 200, aceitando ou rejeitando a cadeia.
 * Quem decide é o SimularMaquinaTuring; este controller só entrega o pedido.
 */
@RestController
@RequestMapping("/api")
public class TuringController {

    private final SimularMaquinaTuring casoDeUso;

    public TuringController(SimularMaquinaTuring casoDeUso) {
        this.casoDeUso = casoDeUso;
    }

    @PostMapping({"/simular", "/turing/simular"})
    public ResponseEntity<ResultadoSimulacao> simular(@RequestBody TuringEntrada pedido) {
        ResultadoSimulacao resultado = casoDeUso.executar(pedido);
        if ("erro".equals(resultado.tipo())) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
