package com.br.unifor.simulador_maquina_turing;

import java.util.List;

public record ResultadoSimulacao(
        String tipo,
        boolean aceita,
        String motivo,
        String fitaFinal,
        int cabecoteFinal,
        String estado,
        List<PassoSimulacao> passos
) {
}
