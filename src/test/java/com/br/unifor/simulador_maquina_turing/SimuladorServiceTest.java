package com.br.unifor.simulador_maquina_turing;

import com.br.unifor.simulador_maquina_turing.dto.SimulacaoRequest;
import com.br.unifor.simulador_maquina_turing.dto.TransicaoEntrada;
import com.br.unifor.simulador_maquina_turing.service.SimuladorService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SimuladorServiceTest {

    private final SimuladorService service = new SimuladorService();

    @Test
    void aceitaQuandoChegaAoEstadoFinal() {
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest("q0", "qf", "", "0", "0", List.of()));

        assertEquals("erro", resultado.tipo());
        assertFalse(resultado.aceita());
        assertTrue(resultado.motivo().contains("transição"));
    }

    @Test
    void recusaCadeiaForaDoAlfabeto() {
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
        ResultadoSimulacao resultado = service.simular(new SimulacaoRequest(
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
}
