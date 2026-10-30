package com.br.unifor.simulador_maquina_turing;

import java.util.ArrayList;
import java.util.List;

/**
 * Fita da máquina de Turing, no modelo do código do professor.
 *
 * A fita é infinita para os dois lados, mas só crescemos as células que o
 * cabeçote realmente visita. O branco é o caractere interno 'B'. Na tela ele
 * aparece como ⊔; a conversão fica no serviço e no diagrama, não aqui.
 *
 * A cadeia de entrada é colocada entre dois brancos e o cabeçote começa na
 * primeira célula da cadeia (índice 1). A cadeia vazia vira "BB" e o cabeçote
 * fica em cima do segundo branco.
 */
public class Fita {
    private List<Character> celulas = new ArrayList<>();
    private int cabecote = 0;
    private final char branco = 'B';

    public Fita(String entrada) {
        celulas.add(branco);
        for (char c : entrada.toCharArray()) {
            celulas.add(c);
        }
        celulas.add(branco);
        // Índice 1 é o primeiro símbolo da cadeia, ou o branco da direita se ela for vazia.
        cabecote = 1;
    }

    /** Símbolo que está debaixo do cabeçote. */
    public char ler() {
        return celulas.get(cabecote);
    }

    /** Troca o símbolo da célula atual. Não move o cabeçote. */
    public void escrever(char simbolo) {
        celulas.set(cabecote, simbolo);
    }

    /**
     * Move o cabeçote. D e R andam para a direita; E e L andam para a esquerda.
     * Se o cabeçote sai da parte já criada, nasce uma célula em branco.
     */
    public void mover(char direcao) {
        if (direcao == 'D' || direcao == 'R') {
            cabecote++;
            if (cabecote >= celulas.size()) {
                celulas.add(branco);
            }
        } else if (direcao == 'E' || direcao == 'L') {
            cabecote--;
            if (cabecote < 0) {
                celulas.add(0, branco);
                cabecote = 0;
            }
        }
    }

    /** Conteúdo atual da fita, da esquerda para a direita, incluindo os brancos. */
    public String conteudo() {
        StringBuilder sb = new StringBuilder();
        for (char c : celulas) {
            sb.append(c);
        }
        return sb.toString();
    }

    public int getCabecote() {
        return cabecote;
    }
}
