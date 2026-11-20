package com.br.unifor.simulador_maquina_turing.dominio.turing;

import java.util.ArrayList;
import java.util.List;

/**
 * Fita da máquina de Turing, como no código do professor.
 *
 * A fita é uma lista de caracteres com um índice, o cabeçote. Ela é infinita
 * para os dois lados, mas a lista só cresce quando o cabeçote sai da parte
 * já criada: nasce uma célula com o branco. O branco interno é o char 'B'.
 * Na página ele é mostrado como ⊔ (o símbolo do livro). Essa troca de desenho
 * não acontece aqui; fica em SimularMaquinaTuring e no frontend (MaquinaTuring.jsx). A cadeia de
 * entrada não pode conter B: o branco não faz parte do alfabeto reconhecido.
 *
 * Exemplo. Cadeia "01" vira as células [B, 0, 1, B] e o cabeçote começa no
 * índice 1, em cima do 0. Há um branco antes e outro depois para a máquina
 * perceber onde a cadeia acaba. Cadeia vazia vira [B, B] e o cabeçote fica
 * no segundo B.
 *
 * mover: D ou R anda para a direita; E ou L anda para a esquerda. O professor
 * usava D e E. L e R foram aceitos também porque aparecem em alguns textos
 * (Left/Right). Escrever troca o símbolo da célula atual e não move.
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
