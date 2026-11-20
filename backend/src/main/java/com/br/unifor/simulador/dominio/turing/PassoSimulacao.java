package com.br.unifor.simulador.dominio.turing;

/**
 * Um passo da computação, para a lista "Transições executadas" da página.
 * O professor imprimia isso no console. Aqui cada passo guarda o estado e a
 * fita de antes de aplicar a regra, o símbolo lido, o que foi escrito, o
 * estado de destino e o movimento. cabecote é o índice da célula lida.
 */
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
