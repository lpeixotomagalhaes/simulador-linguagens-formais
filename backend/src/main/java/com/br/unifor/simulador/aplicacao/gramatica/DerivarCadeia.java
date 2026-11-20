package com.br.unifor.simulador.aplicacao.gramatica;

import com.br.unifor.simulador.aplicacao.comum.Validacao;
import com.br.unifor.simulador.dominio.gramatica.Gramatica;
import com.br.unifor.simulador.dominio.gramatica.GramaticaResultado;


import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Lê V, T, S e P do formulário, confere a gramática e chama a derivação.
 */
public class DerivarCadeia {

    public GramaticaResultado executar(GramaticaEntrada pedido) {
        if (pedido == null) {
            return GramaticaResultado.erro("Envie a gramática e a cadeia.");
        }

        Set<Character> variaveis = new LinkedHashSet<>();
        String falha = Validacao.lerAlfabeto(pedido.variaveis(), variaveis, "S,A");
        if (falha != null) {
            return GramaticaResultado.erro("Variáveis (V): " + falha);
        }
        Set<Character> terminais = new LinkedHashSet<>();
        falha = Validacao.lerAlfabeto(pedido.terminais(), terminais, "a,b");
        if (falha != null) {
            return GramaticaResultado.erro("Terminais (T): " + falha);
        }
        for (char v : variaveis) {
            if (terminais.contains(v)) {
                return GramaticaResultado.erro("O símbolo \"" + v + "\" não pode ser variável e terminal ao mesmo tempo (V ∩ T = ∅).");
            }
        }

        String inicial = Validacao.texto(pedido.simboloInicial());
        if (inicial.length() != 1 || !variaveis.contains(inicial.charAt(0))) {
            return GramaticaResultado.erro("O símbolo inicial deve ser uma das variáveis " + Validacao.formatar(variaveis) + ".");
        }

        Gramatica gramatica = new Gramatica(variaveis, inicial.charAt(0));
        String texto = pedido.producoes() == null ? "" : pedido.producoes();
        int quantidade = 0;
        String[] linhas = texto.split("\\R");
        for (int i = 0; i < linhas.length; i++) {
            String linha = linhas[i].trim();
            if (linha.isEmpty()) {
                continue;
            }
            int n = i + 1;
            String[] lados = linha.split("->|→", 2);
            if (lados.length != 2) {
                return GramaticaResultado.erro("Linha " + n + " das produções: use o formato S -> aSb | λ.");
            }
            String esquerdo = lados[0].trim();
            if (esquerdo.length() != 1 || !variaveis.contains(esquerdo.charAt(0))) {
                return GramaticaResultado.erro("Linha " + n + ": o lado esquerdo \"" + esquerdo
                        + "\" deve ser uma única variável de V. Numa GLC, cada produção tem a forma A → α.");
            }
            for (String alternativa : lados[1].split("\\|", -1)) {
                String direito = alternativa.replace(" ", "");
                if (Validacao.ehLambda(direito)) {
                    direito = "";
                }
                for (char c : direito.toCharArray()) {
                    if (!variaveis.contains(c) && !terminais.contains(c)) {
                        return GramaticaResultado.erro("Linha " + n + ": o símbolo \"" + c
                                + "\" não está em V nem em T.");
                    }
                }
                gramatica.adicionarProducao(esquerdo.charAt(0), direito);
                quantidade++;
            }
        }
        if (quantidade == 0) {
            return GramaticaResultado.erro("Escreva ao menos uma produção. Exemplo: S -> aSb | λ");
        }

        String cadeia = Validacao.texto(pedido.cadeia()).replace(" ", "");
        if (Validacao.ehLambda(cadeia)) {
            cadeia = "";
        }
        falha = Validacao.validarCadeia(cadeia, terminais);
        if (falha != null) {
            return GramaticaResultado.erro(falha.replace("alfabeto", "conjunto de terminais"));
        }
        return gramatica.derivar(cadeia);
    }
}
