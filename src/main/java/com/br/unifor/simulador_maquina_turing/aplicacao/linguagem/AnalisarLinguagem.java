package com.br.unifor.simulador_maquina_turing.aplicacao.linguagem;

import com.br.unifor.simulador_maquina_turing.aplicacao.comum.Validacao;
import com.br.unifor.simulador_maquina_turing.dominio.linguagem.Alfabeto;
import com.br.unifor.simulador_maquina_turing.dominio.linguagem.LinguagemResultado;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Caso de uso do módulo 1: alfabeto Σ, linguagem L, pertinência ao alfabeto,
 * Σ*, Σ+, tamanho da cadeia e concatenação.
 *
 * Valida o que o usuário digitou e usa o Alfabeto (domínio) para as contas.
 * Σ* e Σ+ são infinitos, então são listados só até o comprimento k e até
 * LIMITE_ITENS cadeias.
 */
public class AnalisarLinguagem {

    static final int K_MAXIMO = 6;
    static final int LIMITE_ITENS = 500;

    public LinguagemResultado executar(LinguagemEntrada pedido) {
        if (pedido == null) {
            return LinguagemResultado.erro("Envie o alfabeto e a cadeia.");
        }

        Set<Character> simbolos = new LinkedHashSet<>();
        String falha = Validacao.lerAlfabeto(pedido.alfabeto(), simbolos, "a,b");
        if (falha != null) {
            return LinguagemResultado.erro(falha);
        }
        Alfabeto sigma = new Alfabeto(simbolos);

        int k = pedido.k() == null ? 3 : pedido.k();
        if (k < 1 || k > K_MAXIMO) {
            return LinguagemResultado.erro("O comprimento máximo k para listar Σ* e Σ+ deve ficar entre 1 e " + K_MAXIMO + ".");
        }

        String cadeia = lerCadeia(pedido.cadeia());
        String cadeia2 = lerCadeia(pedido.cadeia2());

        List<String> linguagem = new ArrayList<>();
        String bruto = Validacao.texto(pedido.linguagem());
        if (!bruto.isEmpty()) {
            for (String parte : bruto.replace("{", "").replace("}", "").split("[,;]")) {
                String palavra = lerCadeia(parte);
                if (!sigma.gera(palavra)) {
                    return LinguagemResultado.erro("A linguagem L tem a cadeia \"" + Validacao.mostrar(palavra)
                            + "\", mas L ⊆ Σ*. " + Validacao.validarCadeia(palavra, simbolos));
                }
                if (!linguagem.contains(palavra)) {
                    linguagem.add(palavra);
                }
            }
        }

        boolean valida = sigma.gera(cadeia);
        Boolean pertenceL = bruto.isEmpty() ? null : linguagem.contains(cadeia);
        Alfabeto.Enumeracao estrela = sigma.enumerar(k, LIMITE_ITENS);
        List<String> mais = estrela.cadeias().subList(1, estrela.cadeias().size());
        String concatenacao = cadeia + cadeia2;

        String motivo = valida
                ? "Cadeia válida para Σ = " + Validacao.formatar(sigma.simbolos()) + ": todos os símbolos de \""
                  + Validacao.mostrar(cadeia) + "\" pertencem ao alfabeto. Tamanho = " + cadeia.length() + "."
                : "Cadeia inválida para Σ. " + Validacao.validarCadeia(cadeia, simbolos);

        return new LinguagemResultado(
                valida ? "aceita" : "rejeita",
                motivo,
                sigma.simbolos(),
                Validacao.mostrar(cadeia),
                cadeia.length(),
                valida,
                linguagem.stream().map(Validacao::mostrar).toList(),
                pertenceL,
                Validacao.mostrar(cadeia2),
                sigma.gera(cadeia2),
                Validacao.mostrar(concatenacao),
                concatenacao.length(),
                k,
                estrela.cadeias().stream().map(Validacao::mostrar).toList(),
                List.copyOf(mais),
                estrela.truncado());
    }

    /** "λ", "ε" e vazio viram a cadeia vazia; espaços são ignorados. */
    private String lerCadeia(String valor) {
        String s = Validacao.texto(valor).replace(" ", "");
        return Validacao.ehLambda(s) ? "" : s;
    }
}
