package com.br.unifor.simulador_maquina_turing.aplicacao.gramatica;

/**
 * Corpo do POST /api/gramatica/derivar. G = (V, T, P, S).
 *
 * variaveis       V, como "S,A" (cada variável é um caractere)
 * terminais       T, como "a,b"
 * simboloInicial  S
 * producoes       uma regra por linha, alternativas com |:
 *                   S -> aSb | λ
 *                 "->" ou "→"; λ, ε ou nada do lado direito é a palavra vazia
 * cadeia          w, que se quer derivar a partir de S
 */
public record GramaticaEntrada(
        String variaveis,
        String terminais,
        String simboloInicial,
        String producoes,
        String cadeia
) {
}
