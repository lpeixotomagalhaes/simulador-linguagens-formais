package com.br.unifor.simulador.dominio.pilha;

import java.util.List;

/**
 * Resposta do simulador de autômato com pilha.
 *
 * passos é a sequência de configurações do caminho aceitante; se a cadeia
 * for rejeitada, é o caminho que mais avançou na entrada (para mostrar onde
 * o autômato travou). pilha é escrita com o topo à esquerda; "" é a pilha
 * vazia. passos[0] é a configuração inicial.
 */
public record PilhaResultado(
        String tipo,
        boolean aceita,
        String motivo,
        List<Passo> passos,
        int configuracoesExploradas
) {
    /**
     * estado e pilha são os de depois da transição. lido é o símbolo
     * consumido (λ quando a transição não lê nada). transicao descreve a
     * regra aplicada, como δ(q0, a, Z) = (q0, AZ).
     */
    public record Passo(int numero, String estado, String lido, String restante, String pilha, String transicao) {
    }

    public static PilhaResultado erro(String motivo) {
        return new PilhaResultado("erro", false, motivo, List.of(), 0);
    }
}
