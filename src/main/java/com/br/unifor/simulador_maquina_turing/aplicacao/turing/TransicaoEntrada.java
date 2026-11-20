package com.br.unifor.simulador_maquina_turing.aplicacao.turing;

import com.br.unifor.simulador_maquina_turing.dominio.turing.Transicao;

/**
 * Uma linha do quadro de transições, ainda em texto, do jeito que o
 * formulário manda. O nome estadoInicial aqui é o "estado atual" da tela
 * (de onde a regra sai), o mesmo papel de estadoAtual em Transicao.
 * simboloLido, simboloEscrito e movimento são strings de um caractere
 * ("0", "B", "D"). O serviço é quem transforma isto na Transicao do professor.
 */
public record TransicaoEntrada(
        String estadoInicial,
        String simboloLido,
        String novoEstado,
        String simboloEscrito,
        String movimento
) {
}
