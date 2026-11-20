package com.br.unifor.simulador_maquina_turing.aplicacao.pilha;

import com.br.unifor.simulador_maquina_turing.aplicacao.pilha.PilhaEntrada.TransicaoAP;
import com.br.unifor.simulador_maquina_turing.dominio.pilha.PilhaResultado;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SimularAutomatoPilhaTest {

    private final SimularAutomatoPilha casoDeUso = new SimularAutomatoPilha();

    /** L = { aⁿbⁿ | n ≥ 1 }, aceitação por estado final. */
    private static final List<TransicaoAP> ANBN = List.of(
            new TransicaoAP("q0", "a", "Z", "q0", "AZ"),
            new TransicaoAP("q0", "a", "A", "q0", "AA"),
            new TransicaoAP("q0", "b", "A", "q1", "λ"),
            new TransicaoAP("q1", "b", "A", "q1", "λ"),
            new TransicaoAP("q1", "λ", "Z", "q2", "Z"));

    private PilhaResultado rodar(String cadeia) {
        return casoDeUso.executar(new PilhaEntrada("a,b", "A,Z", "q0", "Z", "q2", "estado", cadeia, ANBN));
    }

    @Test
    void aceitaAnBn() {
        PilhaResultado r = rodar("aabb");

        assertEquals("aceita", r.tipo());
        assertEquals("Z", r.passos().get(0).pilha());
        assertEquals("AAZ", r.passos().get(2).pilha());
        assertEquals("q2", r.passos().get(r.passos().size() - 1).estado());
    }

    @Test
    void rejeitaCadeiasForaDaLinguagem() {
        assertFalse(rodar("aab").aceita());
        assertFalse(rodar("abb").aceita());
        assertFalse(rodar("ba").aceita());
        assertFalse(rodar("").aceita());
    }

    @Test
    void aceitacaoPorPilhaVazia() {
        List<TransicaoAP> t = List.of(
                new TransicaoAP("q0", "a", "Z", "q0", "AZ"),
                new TransicaoAP("q0", "a", "A", "q0", "AA"),
                new TransicaoAP("q0", "b", "A", "q1", "λ"),
                new TransicaoAP("q1", "b", "A", "q1", "λ"),
                new TransicaoAP("q1", "λ", "Z", "q1", "λ"));

        PilhaResultado r = casoDeUso.executar(new PilhaEntrada("a,b", "A,Z", "q0", "Z", "", "pilha", "ab", t));

        assertTrue(r.aceita());
        assertEquals("", r.passos().get(r.passos().size() - 1).pilha());
    }

    /** wwᴿ exige não determinismo: o autômato tem de adivinhar o meio. */
    @Test
    void simulaNaoDeterminismo() {
        List<TransicaoAP> t = List.of(
                new TransicaoAP("q0", "a", "λ", "q0", "a"),
                new TransicaoAP("q0", "b", "λ", "q0", "b"),
                new TransicaoAP("q0", "λ", "λ", "q1", "λ"),
                new TransicaoAP("q1", "a", "a", "q1", "λ"),
                new TransicaoAP("q1", "b", "b", "q1", "λ"),
                new TransicaoAP("q1", "λ", "Z", "q2", "Z"));

        PilhaResultado r = casoDeUso.executar(new PilhaEntrada("a,b", "a,b,Z", "q0", "Z", "q2", "estado", "abba", t));

        assertTrue(r.aceita());
    }

    @Test
    void recusaSimboloDePilhaInvalido() {
        PilhaResultado r = casoDeUso.executar(new PilhaEntrada("a,b", "A,Z", "q0", "Z", "q2", "estado", "ab",
                List.of(new TransicaoAP("q0", "a", "Z", "q0", "XZ"))));

        assertEquals("erro", r.tipo());
        assertTrue(r.motivo().contains("X"));
    }
}
