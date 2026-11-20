package com.br.unifor.simulador.aplicacao.linguagem;

/**
 * Corpo do POST /api/linguagem.
 *
 * alfabeto   Σ, como "a,b" ou "ab"
 * linguagem  L finita, cadeias separadas por vírgula ("ab, aab, λ"); pode vir vazia
 * cadeia     w, a cadeia analisada
 * cadeia2    segunda cadeia para a concatenação w·cadeia2 (pode vir vazia: λ)
 * k          maior comprimento listado em Σ* e Σ+ (1 a 6; padrão 3)
 */
public record LinguagemEntrada(
        String alfabeto,
        String linguagem,
        String cadeia,
        String cadeia2,
        Integer k
) {
}
