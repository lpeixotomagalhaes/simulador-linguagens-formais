package com.br.unifor.simulador.dominio.linguagem;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Alfabeto Σ: conjunto finito e não vazio de símbolos (cada um, um caractere).
 *
 * Responde se uma cadeia pertence a Σ* e lista Σ^0 ∪ Σ^1 ∪ ... ∪ Σ^k em
 * ordem canônica (por tamanho e depois pela ordem dos símbolos em Σ).
 */
public final class Alfabeto {

    /** Cadeias de Σ* até um tamanho; truncado indica que o limite de itens cortou a lista. */
    public record Enumeracao(List<String> cadeias, boolean truncado) {
    }

    private final Set<Character> simbolos;

    public Alfabeto(Collection<Character> simbolos) {
        if (simbolos.isEmpty()) {
            throw new IllegalArgumentException("Um alfabeto não pode ser vazio.");
        }
        this.simbolos = new LinkedHashSet<>(simbolos);
    }

    public List<String> simbolos() {
        return simbolos.stream().map(String::valueOf).toList();
    }

    /** Posição do primeiro símbolo de w fora de Σ, ou -1 se w ∈ Σ*. */
    public int primeiroForaDoAlfabeto(String w) {
        for (int i = 0; i < w.length(); i++) {
            if (!simbolos.contains(w.charAt(i))) {
                return i;
            }
        }
        return -1;
    }

    public boolean gera(String w) {
        return primeiroForaDoAlfabeto(w) < 0;
    }

    /**
     * Gera Σ^0 ∪ ... ∪ Σ^k: cada nível é o anterior concatenado com cada
     * símbolo. Para em limite cadeias, pois |Σ^i| = |Σ|^i cresce depressa.
     */
    public Enumeracao enumerar(int k, int limite) {
        List<String> cadeias = new ArrayList<>();
        cadeias.add("");
        List<String> nivel = List.of("");
        for (int i = 1; i <= k; i++) {
            List<String> proximo = new ArrayList<>();
            for (String prefixo : nivel) {
                for (char s : simbolos) {
                    if (cadeias.size() >= limite) {
                        return new Enumeracao(List.copyOf(cadeias), true);
                    }
                    String palavra = prefixo + s;
                    proximo.add(palavra);
                    cadeias.add(palavra);
                }
            }
            nivel = proximo;
        }
        return new Enumeracao(List.copyOf(cadeias), false);
    }
}
