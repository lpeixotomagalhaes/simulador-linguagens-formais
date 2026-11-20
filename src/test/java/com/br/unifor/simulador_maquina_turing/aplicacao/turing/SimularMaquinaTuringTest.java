package com.br.unifor.simulador_maquina_turing.aplicacao.turing;

import com.br.unifor.simulador_maquina_turing.dominio.turing.ResultadoSimulacao;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SimularMaquinaTuringTest {

    private final SimularMaquinaTuring casoDeUso = new SimularMaquinaTuring();

    @Test
    void aceitaQuandoChegaAoEstadoFinal() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qf",
                "",
                "0,1",
                "000100",
                List.of(
                        new TransicaoEntrada("q0", "0", "q0", "0", "D"),
                        new TransicaoEntrada("q0", "1", "q1", "1", "D"),
                        new TransicaoEntrada("q1", "0", "q1", "0", "D"),
                        new TransicaoEntrada("q1", "B", "q2", "B", "L"),
                        new TransicaoEntrada("q2", "0", "q3", "B", "D"),
                        new TransicaoEntrada("q3", "B", "qf", "B", "D"))));

        assertEquals("aceita", resultado.tipo());
        assertTrue(resultado.aceita());
        assertTrue(resultado.motivo().contains("qf"));
        assertEquals("qf", resultado.estado());
    }

    @Test
    void rejeitaQuandoNaoHaTransicao() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qf",
                "",
                "0,1",
                "1",
                List.of(new TransicaoEntrada("q0", "0", "qf", "0", "D"))));

        assertEquals("rejeita", resultado.tipo());
        assertFalse(resultado.aceita());
        assertTrue(resultado.motivo().contains("q0"));
        assertTrue(resultado.motivo().contains("1"));
    }

    @Test
    void pedeConfiguracaoQuandoFaltamTransicoes() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada("q0", "qf", "", "0", "0", List.of()));

        assertEquals("erro", resultado.tipo());
        assertFalse(resultado.aceita());
        assertTrue(resultado.motivo().contains("transição"));
    }

    @Test
    void recusaCadeiaForaDoAlfabeto() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qf",
                "",
                "0,1",
                "01a",
                List.of(new TransicaoEntrada("q0", "0", "qf", "0", "D"))));

        assertEquals("erro", resultado.tipo());
        assertTrue(resultado.motivo().contains("a"));
        assertTrue(resultado.motivo().contains("alfabeto"));
    }

    @Test
    void permiteSimboloExtraNaFita() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qf",
                "",
                "0",
                "0",
                List.of(new TransicaoEntrada("q0", "0", "qf", "x", "D"))));

        assertEquals("aceita", resultado.tipo());
    }

    @Test
    void permiteBrancoNasTransicoes() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qf",
                "",
                "0",
                "0",
                List.of(
                        new TransicaoEntrada("q0", "0", "q0", "0", "D"),
                        new TransicaoEntrada("q0", "B", "qf", "B", "D"))));

        assertEquals("aceita", resultado.tipo());
    }

    @Test
    void recusaBDentroDoAlfabeto() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qf",
                "",
                "0,B",
                "0",
                List.of(new TransicaoEntrada("q0", "0", "qf", "0", "D"))));

        assertEquals("erro", resultado.tipo());
        assertTrue(resultado.motivo().contains("branco"));
    }

    @Test
    void rejeitaAoChegarNoEstadoDeRejeicao() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qaceita",
                "qrejeita",
                "0,1",
                "1",
                List.of(new TransicaoEntrada("q0", "1", "qrejeita", "1", "D"))));

        assertEquals("rejeita", resultado.tipo());
        assertTrue(resultado.motivo().contains("qrejeita"));
    }

    @Test
    void recusaDuasTransicoesComOMesmoSimboloLido() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qaceita",
                "qrejeita",
                "0,1",
                "00",
                List.of(
                        new TransicaoEntrada("q2", "0", "q1", "x", "D"),
                        new TransicaoEntrada("q2", "0", "q3", "x", "D"))));

        assertEquals("erro", resultado.tipo());
        assertTrue(resultado.motivo().contains("q2"));
        assertTrue(resultado.motivo().contains("0"));
        assertTrue(resultado.motivo().contains("q1"));
        assertTrue(resultado.motivo().contains("q3"));
    }

    @Test
    void aceitaAlfabetoSeparadoPorVirgula() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0",
                "qf",
                "",
                "0, 1",
                "01",
                List.of(
                        new TransicaoEntrada("q0", "0", "q0", "0", "D"),
                        new TransicaoEntrada("q0", "1", "qf", "1", "D"))));

        assertEquals("aceita", resultado.tipo());
    }
    /** Opção B do enunciado: soma unária. 000100 (3 + 2) deixa 00000 na fita. */
    @Test
    void somaUnaria() {
        ResultadoSimulacao resultado = casoDeUso.executar(new TuringEntrada(
                "q0", "qf", "", "0,1", "000100",
                List.of(
                        new TransicaoEntrada("q0", "0", "q0", "0", "D"),
                        new TransicaoEntrada("q0", "1", "q1", "0", "D"),
                        new TransicaoEntrada("q1", "0", "q1", "0", "D"),
                        new TransicaoEntrada("q1", "B", "q2", "B", "E"),
                        new TransicaoEntrada("q2", "0", "q3", "B", "E"),
                        new TransicaoEntrada("q3", "0", "q3", "0", "E"),
                        new TransicaoEntrada("q3", "B", "qf", "B", "D"))));

        assertEquals("aceita", resultado.tipo());
        assertEquals("00000", resultado.fitaFinal().replace("B", ""));
    }

    private static final List<TransicaoEntrada> W_SUSTENIDO_W = List.of(
            new TransicaoEntrada("q0", "0", "q1", "x", "D"),
            new TransicaoEntrada("q0", "1", "q2", "x", "D"),
            new TransicaoEntrada("q0", "#", "q7", "#", "D"),
            new TransicaoEntrada("q1", "0", "q1", "0", "D"),
            new TransicaoEntrada("q1", "1", "q1", "1", "D"),
            new TransicaoEntrada("q1", "#", "q3", "#", "D"),
            new TransicaoEntrada("q2", "0", "q2", "0", "D"),
            new TransicaoEntrada("q2", "1", "q2", "1", "D"),
            new TransicaoEntrada("q2", "#", "q4", "#", "D"),
            new TransicaoEntrada("q3", "x", "q3", "x", "D"),
            new TransicaoEntrada("q3", "0", "q5", "x", "E"),
            new TransicaoEntrada("q4", "x", "q4", "x", "D"),
            new TransicaoEntrada("q4", "1", "q5", "x", "E"),
            new TransicaoEntrada("q5", "x", "q5", "x", "E"),
            new TransicaoEntrada("q5", "#", "q6", "#", "E"),
            new TransicaoEntrada("q6", "0", "q6", "0", "E"),
            new TransicaoEntrada("q6", "1", "q6", "1", "E"),
            new TransicaoEntrada("q6", "x", "q0", "x", "D"),
            new TransicaoEntrada("q7", "x", "q7", "x", "D"),
            new TransicaoEntrada("q7", "B", "qaceita", "B", "D"));

    /** Opção A do enunciado: L = { w#w }. */
    @Test
    void reconheceWSustenidoW() {
        for (String aceita : List.of("01#01", "#", "110#110")) {
            assertEquals("aceita", casoDeUso.executar(new TuringEntrada(
                    "q0", "qaceita", "qrejeita", "0,1,#", aceita, W_SUSTENIDO_W)).tipo(), aceita);
        }
        for (String rejeita : List.of("01#10", "01#011", "0#", "01")) {
            assertEquals("rejeita", casoDeUso.executar(new TuringEntrada(
                    "q0", "qaceita", "qrejeita", "0,1,#", rejeita, W_SUSTENIDO_W)).tipo(), rejeita);
        }
    }
}
