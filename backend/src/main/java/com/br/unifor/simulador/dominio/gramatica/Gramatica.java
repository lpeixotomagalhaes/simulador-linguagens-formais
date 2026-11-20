package com.br.unifor.simulador.dominio.gramatica;

import com.br.unifor.simulador.dominio.comum.Cadeias;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Gramática livre de contexto G = (V, T, P, S).
 *
 * Cada símbolo é um caractere. P fica num mapa variável → lista de lados
 * direitos; "" é a produção vazia (λ).
 *
 * Reconhecimento: busca em largura sobre as formas sentenciais, sempre
 * expandindo a variável mais à esquerda (derivação mais à esquerda). Como
 * a busca é em largura, a primeira derivação encontrada é uma das mais
 * curtas. Podas que mantêm a busca finita para a maioria das gramáticas:
 *   1. os terminais antes da primeira variável têm de ser prefixo de w;
 *   2. os terminais depois da última variável têm de ser sufixo de w;
 *   3. terminais + variáveis não anuláveis ≤ |w| (cada variável não
 *      anulável gera pelo menos um terminal);
 *   4. a forma não pode passar de 2|w| + 6 símbolos (corta laços de
 *      variáveis anuláveis, como S → SS | λ);
 *   5. formas já visitadas não são repetidas;
 *   6. teto de LIMITE_NOS formas.
 */
public class Gramatica {

    static final int LIMITE_NOS = 200_000;

    private final Set<Character> variaveis;
    private final char inicial;
    private final Map<Character, List<String>> producoes = new LinkedHashMap<>();
    private final Set<Character> anulaveis = new HashSet<>();

    public Gramatica(Set<Character> variaveis, char inicial) {
        this.variaveis = variaveis;
        this.inicial = inicial;
    }

    public void adicionarProducao(char variavel, String ladoDireito) {
        List<String> lista = producoes.computeIfAbsent(variavel, k -> new ArrayList<>());
        if (!lista.contains(ladoDireito)) {
            lista.add(ladoDireito);
        }
    }

    /** Nó da busca: a forma sentencial e como se chegou a ela. */
    private record Estado(String forma, Estado pai, char variavel, String ladoDireito) {
    }

    public GramaticaResultado derivar(String w) {
        calcularAnulaveis();
        int limiteTamanho = 2 * w.length() + 6;

        Deque<Estado> fila = new ArrayDeque<>();
        Set<String> visitadas = new HashSet<>();
        Estado raiz = new Estado(String.valueOf(inicial), null, ' ', null);
        fila.add(raiz);
        visitadas.add(raiz.forma());
        int explorados = 0;

        while (!fila.isEmpty()) {
            Estado atual = fila.poll();
            explorados++;
            if (explorados > LIMITE_NOS) {
                return new GramaticaResultado("rejeita", false,
                        "Rejeitada por limite: a busca visitou " + LIMITE_NOS
                                + " formas sentenciais sem derivar a cadeia. A gramática pode ser ambígua demais ou ter laços.",
                        List.of(), null, LIMITE_NOS);
            }
            String forma = atual.forma();
            int posicao = primeiraVariavel(forma);
            if (posicao < 0) {
                if (forma.equals(w)) {
                    return aceitar(atual, w, explorados);
                }
                continue;
            }
            char variavel = forma.charAt(posicao);
            for (String direito : producoes.getOrDefault(variavel, List.of())) {
                String nova = forma.substring(0, posicao) + direito + forma.substring(posicao + 1);
                if (!visitadas.contains(nova) && viavel(nova, w, limiteTamanho)) {
                    visitadas.add(nova);
                    fila.add(new Estado(nova, atual, variavel, direito));
                }
            }
        }
        return new GramaticaResultado("rejeita", false,
                "Rejeitada: nenhuma derivação a partir de " + inicial + " gera \"" + Cadeias.mostrar(w)
                        + "\". A busca esgotou todas as " + explorados + " formas sentenciais possíveis.",
                List.of(), null, explorados);
    }

    private boolean viavel(String forma, String w, int limiteTamanho) {
        if (forma.length() > limiteTamanho) {
            return false;
        }
        int primeira = primeiraVariavel(forma);
        if (primeira < 0) {
            return forma.equals(w);
        }
        if (!w.startsWith(forma.substring(0, primeira))) {
            return false;
        }
        int ultima = forma.length() - 1;
        while (!variaveis.contains(forma.charAt(ultima))) {
            ultima--;
        }
        String sufixo = forma.substring(ultima + 1);
        if (!w.endsWith(sufixo) || primeira + sufixo.length() > w.length()) {
            return false;
        }
        int minimo = 0;
        for (int i = 0; i < forma.length(); i++) {
            char c = forma.charAt(i);
            if (!variaveis.contains(c) || !anulaveis.contains(c)) {
                minimo++;
            }
        }
        return minimo <= w.length();
    }

    private int primeiraVariavel(String forma) {
        for (int i = 0; i < forma.length(); i++) {
            if (variaveis.contains(forma.charAt(i))) {
                return i;
            }
        }
        return -1;
    }

    /** Ponto fixo: A é anulável se tem uma produção só com variáveis anuláveis (ou λ). */
    private void calcularAnulaveis() {
        anulaveis.clear();
        boolean mudou = true;
        while (mudou) {
            mudou = false;
            for (Map.Entry<Character, List<String>> e : producoes.entrySet()) {
                if (anulaveis.contains(e.getKey())) {
                    continue;
                }
                for (String direito : e.getValue()) {
                    if (direito.chars().allMatch(c -> anulaveis.contains((char) c))) {
                        anulaveis.add(e.getKey());
                        mudou = true;
                        break;
                    }
                }
            }
        }
    }

    private GramaticaResultado aceitar(Estado fim, String w, int explorados) {
        List<Estado> caminho = new ArrayList<>();
        for (Estado e = fim; e != null; e = e.pai()) {
            caminho.add(e);
        }
        Collections.reverse(caminho);

        List<GramaticaResultado.Passo> passos = new ArrayList<>();
        NoMutavel raiz = new NoMutavel(inicial);
        for (int i = 0; i < caminho.size(); i++) {
            Estado e = caminho.get(i);
            String producao = null;
            if (e.pai() != null) {
                producao = e.variavel() + " → " + Cadeias.mostrar(e.ladoDireito());
                expandirMaisAEsquerda(raiz, e.ladoDireito());
            }
            passos.add(new GramaticaResultado.Passo(i, Cadeias.mostrar(e.forma()), producao));
        }
        int n = caminho.size() - 1;
        return new GramaticaResultado("aceita", true,
                "Aceita: \"" + Cadeias.mostrar(w) + "\" é gerada pela gramática. Derivação mais à esquerda com "
                        + n + (n == 1 ? " passo." : " passos."),
                passos, raiz.congelar(), explorados);
    }

    /** Nó da árvore enquanto ela é montada. */
    private final class NoMutavel {
        final char simbolo;
        List<NoMutavel> filhos;
        boolean lambda;

        NoMutavel(char simbolo) {
            this.simbolo = simbolo;
        }

        GramaticaResultado.No congelar() {
            if (lambda) {
                return new GramaticaResultado.No(Cadeias.LAMBDA, false, List.of());
            }
            List<GramaticaResultado.No> lista = new ArrayList<>();
            if (filhos != null) {
                for (NoMutavel f : filhos) {
                    lista.add(f.congelar());
                }
            }
            return new GramaticaResultado.No(String.valueOf(simbolo), variaveis.contains(simbolo), lista);
        }
    }

    /**
     * A derivação é mais à esquerda, então a variável expandida em cada passo
     * é a primeira folha-variável da árvore em pré-ordem.
     */
    private void expandirMaisAEsquerda(NoMutavel raiz, String direito) {
        NoMutavel alvo = primeiraFolhaVariavel(raiz);
        if (alvo == null) {
            return;
        }
        alvo.filhos = new ArrayList<>();
        if (direito.isEmpty()) {
            NoMutavel vazio = new NoMutavel(' ');
            vazio.lambda = true;
            alvo.filhos.add(vazio);
            return;
        }
        for (char c : direito.toCharArray()) {
            alvo.filhos.add(new NoMutavel(c));
        }
    }

    private NoMutavel primeiraFolhaVariavel(NoMutavel no) {
        if (no.lambda) {
            return null;
        }
        if (no.filhos == null) {
            return variaveis.contains(no.simbolo) ? no : null;
        }
        for (NoMutavel f : no.filhos) {
            NoMutavel achado = primeiraFolhaVariavel(f);
            if (achado != null) {
                return achado;
            }
        }
        return null;
    }
}
