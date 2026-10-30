package com.br.unifor.simulador_maquina_turing;

/**
 * Uma regra da função de transição δ, no formato do quadro do professor:
 * (estado atual, símbolo lido) → (novo estado, símbolo escrito, movimento).
 *
 * O movimento é D (direita) ou E (esquerda). A máquina é determinística:
 * o par (estado atual, símbolo lido) só pode aparecer uma vez. Essa checagem
 * é feita antes da simulação, em SimuladorService.
 */
public class Transicao {
    private String estadoAtual;
    private char simboloLido;
    private String novoEstado;
    private char simboloEscrito;
    private char movimento;

    public Transicao(String estadoAtual, char simboloLido, String novoEstado, char simboloEscrito, char movimento) {
        this.estadoAtual = estadoAtual;
        this.simboloLido = simboloLido;
        this.novoEstado = novoEstado;
        this.simboloEscrito = simboloEscrito;
        this.movimento = movimento;
    }

    public String getEstadoAtual() {
        return estadoAtual;
    }

    public char getSimboloLido() {
        return simboloLido;
    }

    public String getNovoEstado() {
        return novoEstado;
    }

    public char getSimboloEscrito() {
        return simboloEscrito;
    }

    public char getMovimento() {
        return movimento;
    }
}
