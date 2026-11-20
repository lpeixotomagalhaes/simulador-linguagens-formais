package com.br.unifor.simulador_maquina_turing.dominio.turing;

import java.util.List;

/**
 * O que executar() devolve no lugar do System.out do professor.
 * tipo é "aceita", "rejeita" ou "erro" (erro é configuração inválida, antes
 * de a máquina rodar). motivo é o texto da caixa "Por quê". fitaFinal usa B
 * para o branco; a página troca esse B por ⊔ na hora de desenhar.
 */
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
