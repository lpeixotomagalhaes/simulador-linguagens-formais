package com.br.unifor.simulador.dominio.gramatica;

import java.util.List;

/**
 * Resposta do simulador de GLC.
 *
 * derivacao é a derivação mais à esquerda S ⇒ ... ⇒ w; o primeiro passo é
 * só o símbolo inicial (producao null). arvore é a árvore de derivação; uma
 * folha λ representa a produção vazia. nosExplorados conta as formas
 * sentenciais visitadas pela busca (útil para a análise de complexidade).
 */
public record GramaticaResultado(
        String tipo,
        boolean aceita,
        String motivo,
        List<Passo> derivacao,
        No arvore,
        int nosExplorados
) {
    public record Passo(int numero, String forma, String producao) {
    }

    public record No(String simbolo, boolean variavel, List<No> filhos) {
    }

    public static GramaticaResultado erro(String motivo) {
        return new GramaticaResultado("erro", false, motivo, List.of(), null, 0);
    }
}
