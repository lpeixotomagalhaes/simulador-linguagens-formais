package com.br.unifor.simulador_maquina_turing;

public record PassoSimulacao(
        int numero,
        String estado,
        String simboloLido,
        String fita,
        int cabecote,
        String novoEstado,
        String simboloEscrito,
        String movimento
) {
}
