package com.br.unifor.simulador_maquina_turing.aplicacao.automato;

import com.br.unifor.simulador_maquina_turing.aplicacao.automato.AutomatoEntrada.TransicaoAF;
import com.br.unifor.simulador_maquina_turing.dominio.automato.AutomatoResultado;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SimularAutomatoFinitoTest {

    private final SimularAutomatoFinito casoDeUso = new SimularAutomatoFinito();

    private static final List<TransicaoAF> EXEMPLO = List.of(
            new TransicaoAF("q0", "a", "q1"),
            new TransicaoAF("q1", "b", "q2"));

    @Test
    void exemploDoEnunciado() {
        AutomatoResultado r = casoDeUso.executar(new AutomatoEntrada("AFD", "a,b", "q0", "q2", "ab", EXEMPLO));

        assertEquals("aceita", r.tipo());
        assertEquals("q0 → q1 → q2", r.caminho());
        assertEquals(3, r.passos().size());
        assertTrue(r.motivo().startsWith("ACEITA"));
    }

    @Test
    void afdRejeitaQuandoFaltaTransicao() {
        AutomatoResultado r = casoDeUso.executar(new AutomatoEntrada("AFD", "a,b", "q0", "q2", "aa", EXEMPLO));

        assertEquals("rejeita", r.tipo());
        assertTrue(r.motivo().contains("q1"));
    }

    @Test
    void afdRecusaTransicaoNaoDeterministica() {
        AutomatoResultado r = casoDeUso.executar(new AutomatoEntrada("AFD", "a,b", "q0", "q1", "a", List.of(
                new TransicaoAF("q0", "a", "q0"),
                new TransicaoAF("q0", "a", "q1"))));

        assertEquals("erro", r.tipo());
        assertTrue(r.motivo().contains("AFN"));
    }

    @Test
    void afdRecusaLambda() {
        AutomatoResultado r = casoDeUso.executar(new AutomatoEntrada("AFD", "a", "q0", "q1", "a", List.of(
                new TransicaoAF("q0", "λ", "q1"))));

        assertEquals("erro", r.tipo());
    }

    /** AFN que aceita cadeias sobre {a,b} terminadas em "ab". */
    @Test
    void afnSimulaPorConjuntos() {
        List<TransicaoAF> t = List.of(
                new TransicaoAF("q0", "a", "q0"),
                new TransicaoAF("q0", "b", "q0"),
                new TransicaoAF("q0", "a", "q1"),
                new TransicaoAF("q1", "b", "q2"));

        AutomatoResultado aceita = casoDeUso.executar(new AutomatoEntrada("AFN", "a,b", "q0", "q2", "babab", t));
        AutomatoResultado rejeita = casoDeUso.executar(new AutomatoEntrada("AFN", "a,b", "q0", "q2", "aba", t));

        assertTrue(aceita.aceita());
        assertEquals(List.of("q0", "q2"), aceita.passos().get(5).depois());
        assertFalse(rejeita.aceita());
    }

    @Test
    void afnSegueTransicoesLambda() {
        AutomatoResultado r = casoDeUso.executar(new AutomatoEntrada("AFN", "a", "q0", "q2", "a", List.of(
                new TransicaoAF("q0", "λ", "q1"),
                new TransicaoAF("q1", "a", "q2"))));

        assertTrue(r.aceita());
        assertEquals(List.of("q0", "q1"), r.passos().get(0).depois());
    }

    @Test
    void recusaCadeiaForaDoAlfabeto() {
        AutomatoResultado r = casoDeUso.executar(new AutomatoEntrada("AFD", "a,b", "q0", "q2", "abc", EXEMPLO));

        assertEquals("erro", r.tipo());
    }
}
