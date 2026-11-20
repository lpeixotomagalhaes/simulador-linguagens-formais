package com.br.unifor.simulador.dominio.automato;

import com.br.unifor.simulador.dominio.comum.Cadeias;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * Autômato finito M = (Q, Σ, δ, q0, F).
 *
 * δ fica num mapa estado → (símbolo → conjunto de destinos). A chave ""
 * guarda as transições λ. O mesmo código simula AFD e AFN: num AFD cada
 * conjunto tem um destino só e nunca há λ, então o "conjunto de estados
 * ativos" tem sempre no máximo um elemento.
 *
 * Simulação do AFN por conjuntos (construção de subconjuntos sob demanda):
 *   S0 = fecho-λ({q0})
 *   Si = fecho-λ( ∪ δ(q, wi) para q em Si-1 )
 *   aceita se S|w| ∩ F ≠ ∅
 */
public class AutomatoFinito {

    private final boolean deterministico;
    private final String inicial;
    private final Set<String> finais;
    private final Map<String, Map<String, Set<String>>> delta = new LinkedHashMap<>();

    public AutomatoFinito(boolean deterministico, String inicial, Set<String> finais) {
        this.deterministico = deterministico;
        this.inicial = inicial;
        this.finais = finais;
    }

    /** simbolo "" é a transição λ. Devolve false se o par já tinha destino. */
    public boolean adicionarTransicao(String origem, String simbolo, String destino) {
        Set<String> destinos = delta
                .computeIfAbsent(origem, k -> new LinkedHashMap<>())
                .computeIfAbsent(simbolo, k -> new LinkedHashSet<>());
        boolean jaTinha = !destinos.isEmpty();
        destinos.add(destino);
        return !jaTinha;
    }

    public AutomatoResultado executar(String cadeia) {
        String modelo = deterministico ? "AFD" : "AFN";
        List<AutomatoResultado.Passo> passos = new ArrayList<>();
        Set<String> atual = fecho(Set.of(inicial));
        List<String> caminho = new ArrayList<>();
        caminho.add(nomear(atual));
        passos.add(new AutomatoResultado.Passo(0, null, List.of(), ordenar(atual), Cadeias.mostrar(cadeia)));

        for (int i = 0; i < cadeia.length(); i++) {
            String simbolo = String.valueOf(cadeia.charAt(i));
            Set<String> proximo = new LinkedHashSet<>();
            for (String q : atual) {
                proximo.addAll(delta.getOrDefault(q, Map.of()).getOrDefault(simbolo, Set.of()));
            }
            proximo = fecho(proximo);
            passos.add(new AutomatoResultado.Passo(i + 1, simbolo, ordenar(atual), ordenar(proximo),
                    Cadeias.mostrar(cadeia.substring(i + 1))));

            if (proximo.isEmpty()) {
                String motivo = deterministico
                        ? "REJEITA: não existe transição saindo de \"" + nomear(atual) + "\" com o símbolo \""
                          + simbolo + "\" (posição " + (i + 1) + "). O AFD para sem consumir a cadeia toda."
                        : "REJEITA: nenhum estado ativo " + nomear(atual) + " tem transição com \"" + simbolo
                          + "\" (posição " + (i + 1) + "). O conjunto de estados ficou vazio.";
                caminho.add("∅");
                return new AutomatoResultado("rejeita", false, motivo, modelo, String.join(" → ", caminho), passos);
            }
            atual = proximo;
            caminho.add(nomear(atual));
        }

        Set<String> atingidos = new TreeSet<>(atual);
        atingidos.retainAll(finais);
        boolean aceita = !atingidos.isEmpty();
        String motivo;
        if (aceita) {
            motivo = deterministico
                    ? "ACEITA: a cadeia foi lida até o fim e o autômato parou no estado final \"" + nomear(atual) + "\"."
                    : "ACEITA: depois de ler a cadeia, os estados ativos " + nomear(atual)
                      + " incluem o(s) estado(s) final(is) " + Cadeias.formatar(atingidos) + ".";
        } else {
            motivo = deterministico
                    ? "REJEITA: a cadeia foi lida até o fim, mas o estado \"" + nomear(atual) + "\" não é final."
                    : "REJEITA: nenhum dos estados ativos " + nomear(atual) + " é final.";
        }
        return new AutomatoResultado(aceita ? "aceita" : "rejeita", aceita, motivo, modelo,
                String.join(" → ", caminho), passos);
    }

    /** Fecho-λ: tudo que se alcança só com transições vazias. Busca em profundidade. */
    private Set<String> fecho(Set<String> estados) {
        Set<String> resultado = new LinkedHashSet<>(estados);
        Deque<String> pilha = new ArrayDeque<>(estados);
        while (!pilha.isEmpty()) {
            String q = pilha.pop();
            for (String r : delta.getOrDefault(q, Map.of()).getOrDefault("", Set.of())) {
                if (resultado.add(r)) {
                    pilha.push(r);
                }
            }
        }
        return resultado;
    }

    private List<String> ordenar(Set<String> estados) {
        return List.copyOf(new TreeSet<>(estados));
    }

    private String nomear(Set<String> estados) {
        if (deterministico && estados.size() == 1) {
            return estados.iterator().next();
        }
        return estados.isEmpty() ? "∅" : "{" + String.join(",", new TreeSet<>(estados)) + "}";
    }
}
