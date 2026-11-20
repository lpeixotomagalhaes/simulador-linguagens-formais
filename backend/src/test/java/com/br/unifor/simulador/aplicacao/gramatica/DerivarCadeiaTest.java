package com.br.unifor.simulador.aplicacao.gramatica;

import com.br.unifor.simulador.dominio.gramatica.GramaticaResultado;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DerivarCadeiaTest {

    private final DerivarCadeia casoDeUso = new DerivarCadeia();

    @Test
    void exemploDoEnunciado() {
        GramaticaResultado r = casoDeUso.executar(new GramaticaEntrada("S", "a,b", "S", "S -> aSb | λ", "aaabbb"));

        assertEquals("aceita", r.tipo());
        assertEquals("S", r.derivacao().get(0).forma());
        assertEquals("aaabbb", r.derivacao().get(r.derivacao().size() - 1).forma());
        assertEquals(5, r.derivacao().size());
        assertNotNull(r.arvore());
        assertEquals("S", r.arvore().simbolo());
        assertEquals(3, r.arvore().filhos().size());
    }

    @Test
    void rejeitaCadeiaQueNaoEGerada() {
        GramaticaResultado r = casoDeUso.executar(new GramaticaEntrada("S", "a,b", "S", "S -> aSb | λ", "aab"));

        assertEquals("rejeita", r.tipo());
        assertFalse(r.aceita());
    }

    @Test
    void aceitaPalavraVaziaQuandoSAnulavel() {
        GramaticaResultado r = casoDeUso.executar(new GramaticaEntrada("S", "a,b", "S", "S -> aSb | λ", ""));

        assertTrue(r.aceita());
        assertEquals("λ", r.arvore().filhos().get(0).simbolo());
    }

    @Test
    void gramaticaComVariasVariaveisELacoAnulavel() {
        // Parênteses balanceados com S -> SS, que gera laços de formas anuláveis.
        GramaticaResultado r = casoDeUso.executar(new GramaticaEntrada("S", "(,)", "S", "S -> (S) | SS | λ", "(()())"));

        assertTrue(r.aceita());
    }

    @Test
    void recusaProducaoComSimboloDesconhecido() {
        GramaticaResultado r = casoDeUso.executar(new GramaticaEntrada("S", "a,b", "S", "S -> aXb", "ab"));

        assertEquals("erro", r.tipo());
        assertTrue(r.motivo().contains("X"));
    }

    @Test
    void recusaLadoEsquerdoQueNaoEVariavel() {
        GramaticaResultado r = casoDeUso.executar(new GramaticaEntrada("S", "a,b", "S", "aS -> b", "b"));

        assertEquals("erro", r.tipo());
    }
}
