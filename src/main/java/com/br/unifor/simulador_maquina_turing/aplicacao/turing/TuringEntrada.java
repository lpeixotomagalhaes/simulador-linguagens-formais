package com.br.unifor.simulador_maquina_turing.aplicacao.turing;

import java.util.List;

/**
 * Corpo do POST /api/simular. São os dados que, no main do professor,
 * estavam escritos no código: estado inicial, estado final, cadeia e a
 * lista de transições. alfabeto e estadosRejeita não existiam naquele main.
 * estadosFinais e estadosRejeita chegam como texto separado por vírgula
 * ("qaceita" ou, se um dia houver mais de um, "qaceita,q2").
 */
public record TuringEntrada(
        String estadoInicial,
        String estadosFinais,
        String estadosRejeita,
        String alfabeto,
        String cadeia,
        List<TransicaoEntrada> transicoes
) {
}
