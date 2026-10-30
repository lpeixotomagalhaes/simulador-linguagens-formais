package com.br.unifor.simulador_maquina_turing.dto;

import java.util.List;

public record SimulacaoRequest(
        String estadoInicial,
        String estadosFinais,
        String estadosRejeita,
        String alfabeto,
        String cadeia,
        List<TransicaoEntrada> transicoes
) {
}
