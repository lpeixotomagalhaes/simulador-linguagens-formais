package com.br.unifor.simulador.dominio.comum;

import java.util.Collection;
import java.util.stream.Collectors;

/**
 * Convenções de escrita de cadeias e conjuntos usadas pelos modelos.
 *
 * Fica no domínio para que os modelos (autômatos, gramática, máquina) não
 * dependam da camada de aplicação, que valida a entrada do usuário.
 */
public final class Cadeias {

    /** Palavra vazia, como é escrita na disciplina. */
    public static final String LAMBDA = "λ";

    private Cadeias() {
    }

    /** Cadeia como aparece na tela: a vazia vira λ. */
    public static String mostrar(String cadeia) {
        return cadeia == null || cadeia.isEmpty() ? LAMBDA : cadeia;
    }

    /** Conjunto escrito como {a, b}. */
    public static String formatar(Collection<?> itens) {
        return "{" + itens.stream().map(String::valueOf).collect(Collectors.joining(", ")) + "}";
    }
}
