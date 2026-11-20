package com.br.unifor.simulador.dominio.automato;

import java.util.List;

/**
 * Resposta do simulador de autômato finito.
 *
 * caminho é a sequência de estados (AFD: um estado por passo; AFN: o
 * conjunto de estados ativos escrito como {q0,q1}), no formato do PDF:
 * "q0 → q1 → q2". passos[0] é a configuração inicial (sem símbolo lido).
 */
public record AutomatoResultado(
        String tipo,
        boolean aceita,
        String motivo,
        String modelo,
        String caminho,
        List<Passo> passos
) {
    /**
     * Um passo. lido é o símbolo consumido (null no passo 0). antes e
     * depois são os estados ativos; no AFD cada lista tem no máximo um item.
     * restante é o que falta ler depois deste passo.
     */
    public record Passo(int numero, String lido, List<String> antes, List<String> depois, String restante) {
    }

    public static AutomatoResultado erro(String motivo) {
        return new AutomatoResultado("erro", false, motivo, "", "", List.of());
    }
}
