package com.br.unifor.simulador_maquina_turing.aplicacao.linguagem;

import com.br.unifor.simulador_maquina_turing.dominio.linguagem.LinguagemResultado;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AnalisarLinguagemTest {

    private final AnalisarLinguagem casoDeUso = new AnalisarLinguagem();

    @Test
    void exemploDoEnunciado() {
        LinguagemResultado r = casoDeUso.executar(new LinguagemEntrada("a,b", "", "abba", "", 2));

        assertEquals("aceita", r.tipo());
        assertTrue(r.cadeiaValida());
        assertEquals(4, r.tamanho());
        assertTrue(r.motivo().contains("Cadeia válida"));
        assertNull(r.pertenceL());
    }

    @Test
    void listaSigmaEstrelaESigmaMaisEmOrdemCanonica() {
        LinguagemResultado r = casoDeUso.executar(new LinguagemEntrada("a,b", "", "a", "", 2));

        assertEquals(List.of("λ", "a", "b", "aa", "ab", "ba", "bb"), r.sigmaEstrela());
        assertEquals(List.of("a", "b", "aa", "ab", "ba", "bb"), r.sigmaMais());
        assertFalse(r.truncado());
    }

    @Test
    void concatenaETestaPertinenciaEmL() {
        LinguagemResultado r = casoDeUso.executar(new LinguagemEntrada("ab", "ab, aab, λ", "ab", "ba", 1));

        assertEquals("abba", r.concatenacao());
        assertEquals(4, r.tamanhoConcatenacao());
        assertTrue(r.pertenceL());
        assertEquals(List.of("ab", "aab", "λ"), r.linguagem());
    }

    @Test
    void rejeitaCadeiaComSimboloForaDoAlfabeto() {
        LinguagemResultado r = casoDeUso.executar(new LinguagemEntrada("a,b", "", "abc", "", 2));

        assertEquals("rejeita", r.tipo());
        assertFalse(r.cadeiaValida());
        assertTrue(r.motivo().contains("c"));
    }

    @Test
    void cadeiaVaziaTemTamanhoZero() {
        LinguagemResultado r = casoDeUso.executar(new LinguagemEntrada("a,b", "", "λ", "", 1));

        assertEquals("aceita", r.tipo());
        assertEquals(0, r.tamanho());
        assertEquals("λ", r.cadeia());
    }

    @Test
    void recusaLinguagemForaDeSigmaEstrela() {
        LinguagemResultado r = casoDeUso.executar(new LinguagemEntrada("a,b", "ab, ac", "ab", "", 1));

        assertEquals("erro", r.tipo());
    }
}
