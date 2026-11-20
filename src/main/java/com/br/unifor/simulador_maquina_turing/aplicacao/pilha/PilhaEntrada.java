package com.br.unifor.simulador_maquina_turing.aplicacao.pilha;

import java.util.List;

/**
 * Corpo do POST /api/pilha/simular. M = (Q, Σ, Γ, δ, q0, Z, F).
 *
 * alfabeto        Σ, alfabeto de entrada
 * alfabetoPilha   Γ, alfabeto da pilha (tem de conter Z)
 * simboloPilha    Z, símbolo que começa na pilha
 * criterio        "estado" (aceita em estado final com a entrada lida) ou
 *                 "pilha" (aceita com a entrada lida e a pilha vazia)
 * transicoes      δ(origem, le, desempilha) = (destino, empilha). le e
 *                 desempilha podem ser λ. empilha é uma palavra de Γ*, o
 *                 primeiro caractere fica no topo ("AZ" põe A sobre Z).
 */
public record PilhaEntrada(
        String alfabeto,
        String alfabetoPilha,
        String estadoInicial,
        String simboloPilha,
        String estadosFinais,
        String criterio,
        String cadeia,
        List<TransicaoAP> transicoes
) {
    public record TransicaoAP(String origem, String le, String desempilha, String destino, String empilha) {
    }
}
