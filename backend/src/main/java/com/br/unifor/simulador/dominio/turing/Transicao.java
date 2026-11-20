package com.br.unifor.simulador.dominio.turing;

/**
 * Uma regra da função de transição δ.
 *
 * É a mesma classe do professor: cinco dados, na ordem do quadro.
 *   estadoAtual    de qual estado a regra sai
 *   simboloLido    o que o cabeçote tem de estar lendo (um char)
 *   novoEstado     para qual estado a máquina vai
 *   simboloEscrito o que fica escrito no lugar do símbolo lido
 *   movimento      D (direita) ou E (esquerda). O professor também usava L
 *                  para esquerda; o serviço converte L em E antes de criar
 *                  este objeto. R vira D.
 *
 * No main do professor um objeto destes nascia com valores fixos, por exemplo
 * new Transicao("q0", '0', "q0", '0', 'D'). A classe original não tinha
 * construtor, então esses campos não podiam ser preenchidos. O construtor
 * abaixo foi acrescentado para isso.
 *
 * Na web a linha do formulário chega como texto (TransicaoEntrada). O
 * SimularMaquinaTuring confere se está completa e só então cria esta Transicao.
 * O par (estadoAtual, simboloLido) só pode existir uma vez: máquina
 * determinística. Quem barra a repetição é SimularMaquinaTuring.transicaoRepetida,
 * não esta classe.
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
