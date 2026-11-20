package com.br.unifor.simulador_maquina_turing.aplicacao.automato;

import java.util.List;

/**
 * Corpo do POST /api/automato/simular. É também o formato do JSON que a
 * página importa e exporta ("carregar um autômato por JSON"):
 *
 * {
 *   "tipo": "AFD",
 *   "alfabeto": "a,b",
 *   "estadoInicial": "q0",
 *   "estadosFinais": "q2",
 *   "cadeia": "ab",
 *   "transicoes": [ {"origem":"q0","simbolo":"a","destino":"q1"},
 *                   {"origem":"q1","simbolo":"b","destino":"q2"} ]
 * }
 *
 * tipo é "AFD" ou "AFN". No AFN o símbolo pode ser λ (transição vazia) e o
 * mesmo par (origem, símbolo) pode ter vários destinos, um por linha.
 */
public record AutomatoEntrada(
        String tipo,
        String alfabeto,
        String estadoInicial,
        String estadosFinais,
        String cadeia,
        List<TransicaoAF> transicoes
) {
    public record TransicaoAF(String origem, String simbolo, String destino) {
    }
}
