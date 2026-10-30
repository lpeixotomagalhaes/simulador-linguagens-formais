package com.br.unifor.simulador_maquina_turing.dto;

public record TransicaoEntrada(
        String estadoInicial,
        String simboloLido,
        String novoEstado,
        String simboloEscrito,
        String movimento
) {
}
