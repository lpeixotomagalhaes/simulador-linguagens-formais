package com.br.unifor.simulador_maquina_turing.aplicacao.automato;

import com.br.unifor.simulador_maquina_turing.aplicacao.comum.Validacao;
import com.br.unifor.simulador_maquina_turing.dominio.automato.AutomatoFinito;
import com.br.unifor.simulador_maquina_turing.dominio.automato.AutomatoResultado;


import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Valida o pedido e monta o AutomatoFinito. Ordem: tipo, estado inicial,
 * estados finais, alfabeto, transições (estados válidos, símbolo em Σ ou λ
 * no AFN, determinismo no AFD), cadeia em Σ*.
 */
public class SimularAutomatoFinito {

    public AutomatoResultado executar(AutomatoEntrada pedido) {
        if (pedido == null) {
            return AutomatoResultado.erro("Envie o autômato e a cadeia.");
        }
        String tipo = Validacao.texto(pedido.tipo()).toUpperCase();
        if (tipo.isEmpty()) {
            tipo = "AFD";
        }
        if (!tipo.equals("AFD") && !tipo.equals("AFN")) {
            return AutomatoResultado.erro("O tipo do autômato deve ser AFD ou AFN.");
        }
        boolean afd = tipo.equals("AFD");

        String inicial = Validacao.texto(pedido.estadoInicial());
        String falha = Validacao.validarEstado(inicial, "o estado inicial");
        if (falha != null) {
            return AutomatoResultado.erro(falha);
        }

        Set<String> finais = new LinkedHashSet<>();
        falha = Validacao.lerEstados(pedido.estadosFinais(), finais, false,
                "Informe ao menos um estado final (F). Exemplo: q2.");
        if (falha != null) {
            return AutomatoResultado.erro(falha);
        }

        Set<Character> alfabeto = new LinkedHashSet<>();
        falha = Validacao.lerAlfabeto(pedido.alfabeto(), alfabeto, "a,b");
        if (falha != null) {
            return AutomatoResultado.erro(falha);
        }

        List<AutomatoEntrada.TransicaoAF> transicoes = pedido.transicoes() == null ? List.of() : pedido.transicoes();
        if (transicoes.isEmpty()) {
            return AutomatoResultado.erro("Adicione ao menos uma transição.");
        }

        AutomatoFinito automato = new AutomatoFinito(afd, inicial, finais);
        for (int i = 0; i < transicoes.size(); i++) {
            AutomatoEntrada.TransicaoAF t = transicoes.get(i);
            int n = i + 1;
            if (t == null) {
                return AutomatoResultado.erro("A transição " + n + " está vazia.");
            }
            String origem = Validacao.texto(t.origem());
            String destino = Validacao.texto(t.destino());
            String simbolo = Validacao.texto(t.simbolo());
            falha = Validacao.validarEstado(origem, "a origem da transição " + n);
            if (falha == null) {
                falha = Validacao.validarEstado(destino, "o destino da transição " + n);
            }
            if (falha != null) {
                return AutomatoResultado.erro(falha);
            }
            if (Validacao.ehLambda(simbolo)) {
                if (afd) {
                    return AutomatoResultado.erro("A transição " + n + " usa λ. Transições vazias só existem no AFN; troque o tipo para AFN.");
                }
                simbolo = "";
            } else if (simbolo.length() != 1 || !alfabeto.contains(simbolo.charAt(0))) {
                return AutomatoResultado.erro("Na transição " + n + ", o símbolo \"" + simbolo
                        + "\" não pertence ao alfabeto " + Validacao.formatar(alfabeto) + ".");
            }
            boolean novo = automato.adicionarTransicao(origem, simbolo, destino);
            if (afd && !novo) {
                return AutomatoResultado.erro("O estado \"" + origem + "\" tem mais de uma transição com o símbolo \""
                        + simbolo + "\". Num AFD, δ(q, a) tem no máximo um destino. Para permitir isso, troque o tipo para AFN.");
            }
        }

        String cadeia = Validacao.texto(pedido.cadeia());
        if (Validacao.ehLambda(cadeia)) {
            cadeia = "";
        }
        falha = Validacao.validarCadeia(cadeia, alfabeto);
        if (falha != null) {
            return AutomatoResultado.erro(falha);
        }
        return automato.executar(cadeia);
    }
}
