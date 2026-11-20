package com.br.unifor.simulador_maquina_turing.aplicacao.pilha;

import com.br.unifor.simulador_maquina_turing.aplicacao.comum.Validacao;
import com.br.unifor.simulador_maquina_turing.dominio.linguagem.Alfabeto;
import com.br.unifor.simulador_maquina_turing.dominio.pilha.AutomatoPilha;
import com.br.unifor.simulador_maquina_turing.dominio.pilha.PilhaResultado;


import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Valida o formulário do autômato com pilha e monta o AutomatoPilha.
 */
public class SimularAutomatoPilha {

    public PilhaResultado executar(PilhaEntrada pedido) {
        if (pedido == null) {
            return PilhaResultado.erro("Envie o autômato com pilha e a cadeia.");
        }

        String inicial = Validacao.texto(pedido.estadoInicial());
        String falha = Validacao.validarEstado(inicial, "o estado inicial");
        if (falha != null) {
            return PilhaResultado.erro(falha);
        }

        boolean porPilhaVazia = "pilha".equalsIgnoreCase(Validacao.texto(pedido.criterio()));
        Set<String> finais = new LinkedHashSet<>();
        falha = Validacao.lerEstados(pedido.estadosFinais(), finais, porPilhaVazia,
                "Informe ao menos um estado final (F), ou escolha aceitação por pilha vazia.");
        if (falha != null) {
            return PilhaResultado.erro(falha);
        }

        Set<Character> sigma = new LinkedHashSet<>();
        falha = Validacao.lerAlfabeto(pedido.alfabeto(), sigma, "a,b");
        if (falha != null) {
            return PilhaResultado.erro("Alfabeto de entrada (Σ): " + falha);
        }
        Set<Character> gamma = new LinkedHashSet<>();
        falha = Validacao.lerAlfabeto(pedido.alfabetoPilha(), gamma, "A,Z");
        if (falha != null) {
            return PilhaResultado.erro("Alfabeto da pilha (Γ): " + falha);
        }

        String z = Validacao.texto(pedido.simboloPilha());
        if (z.length() != 1 || !gamma.contains(z.charAt(0))) {
            return PilhaResultado.erro("O símbolo inicial da pilha deve ser um caractere de Γ = " + Validacao.formatar(gamma) + ".");
        }

        List<PilhaEntrada.TransicaoAP> transicoes = pedido.transicoes() == null ? List.of() : pedido.transicoes();
        if (transicoes.isEmpty()) {
            return PilhaResultado.erro("Adicione ao menos uma transição.");
        }

        AutomatoPilha ap = new AutomatoPilha(inicial, z.charAt(0), finais, porPilhaVazia);
        for (int i = 0; i < transicoes.size(); i++) {
            PilhaEntrada.TransicaoAP t = transicoes.get(i);
            int n = i + 1;
            if (t == null) {
                return PilhaResultado.erro("A transição " + n + " está vazia.");
            }
            String origem = Validacao.texto(t.origem());
            String destino = Validacao.texto(t.destino());
            falha = Validacao.validarEstado(origem, "a origem da transição " + n);
            if (falha == null) {
                falha = Validacao.validarEstado(destino, "o destino da transição " + n);
            }
            if (falha != null) {
                return PilhaResultado.erro(falha);
            }

            String le = lambdaOuTexto(t.le());
            if (le.length() > 1 || (le.length() == 1 && !sigma.contains(le.charAt(0)))) {
                return PilhaResultado.erro("Na transição " + n + ", o símbolo lido \"" + le
                        + "\" deve ser λ ou um símbolo de Σ = " + Validacao.formatar(sigma) + ".");
            }
            String desempilha = lambdaOuTexto(t.desempilha());
            if (desempilha.length() > 1 || (desempilha.length() == 1 && !gamma.contains(desempilha.charAt(0)))) {
                return PilhaResultado.erro("Na transição " + n + ", o topo desempilhado \"" + desempilha
                        + "\" deve ser λ ou um símbolo de Γ = " + Validacao.formatar(gamma) + ".");
            }
            String empilha = lambdaOuTexto(t.empilha());
            for (char c : empilha.toCharArray()) {
                if (!gamma.contains(c)) {
                    return PilhaResultado.erro("Na transição " + n + ", o símbolo empilhado \"" + c
                            + "\" não pertence a Γ = " + Validacao.formatar(gamma) + ".");
                }
            }
            ap.adicionarRegra(new AutomatoPilha.Regra(origem, le, desempilha, destino, empilha));
        }

        String cadeia = lambdaOuTexto(pedido.cadeia());
        falha = Validacao.validarCadeia(cadeia, sigma);
        if (falha != null) {
            return PilhaResultado.erro(falha);
        }
        return ap.executar(cadeia);
    }

    private String lambdaOuTexto(String valor) {
        String s = Validacao.texto(valor).replace(" ", "");
        return Validacao.ehLambda(s) ? "" : s;
    }
}
