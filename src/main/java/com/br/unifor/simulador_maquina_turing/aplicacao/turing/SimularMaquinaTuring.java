package com.br.unifor.simulador_maquina_turing.aplicacao.turing;

import com.br.unifor.simulador_maquina_turing.aplicacao.comum.Validacao;
import com.br.unifor.simulador_maquina_turing.dominio.turing.Fita;
import com.br.unifor.simulador_maquina_turing.dominio.turing.MaquinaTuring;
import com.br.unifor.simulador_maquina_turing.dominio.turing.ResultadoSimulacao;
import com.br.unifor.simulador_maquina_turing.dominio.turing.Transicao;


import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Liga o formulário da página à máquina do professor.
 *
 * No main antigo, cada regra era uma linha fixa:
 *   mt.adicionarTransicao(new Transicao("q0", '0', "q0", '0', 'D'));
 * Esta classe faz o mesmo trabalho, mas com a lista que o usuário preencheu.
 * O navegador manda um TuringEntrada (estado inicial, finais, alfabeto,
 * cadeia e a lista de transições). simular() confere esses dados e, se
 * estiver tudo válido, cria a MaquinaTuring, chama adicionarTransicao uma
 * vez por linha e devolve o resultado de executar().
 *
 * Nada disso fica gravado em arquivo nem em banco. A configuração existe só
 * enquanto a requisição está sendo atendida. A quantidade de estados também
 * não é armazenada: |Q| é calculado na página, em DiagramaEstados.jsx (montarEstados).
 */
public class SimularMaquinaTuring {

    static final char BRANCO = 'B';

    /**
     * Ordem da validação, antes de rodar a máquina:
     * 1. estado inicial, no formato q0 (letra e depois letras, números ou _);
     * 2. estados de aceitação (obrigatório) e de rejeição (pode vir vazio,
     *    no modo "somente qfinal");
     * 3. alfabeto Σ, separado em lerAlfabeto;
     * 4. pelo menos uma transição;
     * 5. cada caractere da cadeia tem de estar em Σ (a cadeia vazia é a
     *    palavra vazia e é permitida);
     * 6. nenhuma dupla (estado, símbolo lido).
     * Só então a fita é criada e as transições são registradas.
     */
    public ResultadoSimulacao executar(TuringEntrada pedido) {
        if (pedido == null) {
            return erro("Envie o estado inicial, os estados finais, o alfabeto, a cadeia e as transições.");
        }

        String estadoInicial = texto(pedido.estadoInicial());
        String falhaEstado = validarEstado(estadoInicial, "o estado inicial");
        if (falhaEstado != null) {
            return erro(falhaEstado);
        }

        Set<String> estadosFinais = new LinkedHashSet<>();
        String falhaFinais = lerEstadosFinais(pedido.estadosFinais(), estadosFinais, false);
        if (falhaFinais != null) {
            return erro(falhaFinais);
        }

        Set<String> estadosRejeita = new LinkedHashSet<>();
        String falhaRejeita = lerEstadosFinais(pedido.estadosRejeita(), estadosRejeita, true);
        if (falhaRejeita != null) {
            return erro(falhaRejeita);
        }
        for (String estado : estadosRejeita) {
            if (estadosFinais.contains(estado)) {
                return erro("O estado \"" + estado + "\" não pode ser de aceitação e de rejeição ao mesmo tempo.");
            }
        }

        Set<Character> alfabeto = new LinkedHashSet<>();
        String falhaAlfabeto = lerAlfabeto(pedido.alfabeto(), alfabeto);
        if (falhaAlfabeto != null) {
            return erro(falhaAlfabeto);
        }

        List<TransicaoEntrada> entradas = pedido.transicoes() == null ? List.of() : pedido.transicoes();
        if (entradas.isEmpty()) {
            return erro("Adicione ao menos uma transição no quadro do autômato.");
        }

        String cadeia = pedido.cadeia() == null ? "" : pedido.cadeia();
        String falhaCadeia = validarCadeia(cadeia, alfabeto);
        if (falhaCadeia != null) {
            return erro(falhaCadeia);
        }

        String repetida = transicaoRepetida(entradas);
        if (repetida != null) {
            return erro(repetida);
        }

        MaquinaTuring maquina = new MaquinaTuring(estadoInicial, estadosFinais, estadosRejeita, new Fita(cadeia));
        // Cada item da lista ocupa o lugar de uma linha adicionarTransicao
        // que o professor tinha escrito no main.
        for (int i = 0; i < entradas.size(); i++) {
            String falha = adicionarTransicao(maquina, entradas.get(i), i + 1);
            if (falha != null) {
                return erro(falha);
            }
        }

        return maquina.executar();
    }

    /**
     * Máquina determinística: δ(estado, símbolo) tem no máximo um destino.
     * A chave é estado + símbolo já normalizado (B, ⊔, □ e ⌴ contam como o
     * mesmo branco). Se a chave já existia, as duas linhas conflitam, mesmo
     * que o símbolo escrito ou o movimento sejam diferentes. O código do
     * professor não fazia essa checagem: findFirst seguia só a primeira regra
     * e a outra era ignorada.
     */
    private String transicaoRepetida(List<TransicaoEntrada> entradas) {
        Map<String, String> destinoPorLeitura = new LinkedHashMap<>();
        for (TransicaoEntrada entrada : entradas) {
            if (entrada == null) {
                continue;
            }
            String estado = texto(entrada.estadoInicial());
            String lido = texto(entrada.simboloLido());
            String novo = texto(entrada.novoEstado());
            if (estado.isEmpty() || lido.length() != 1 || novo.isEmpty()) {
                continue;
            }
            char simbolo = normalizarSimbolo(lido);
            String chave = estado + "\0" + simbolo;
            String destinoAnterior = destinoPorLeitura.putIfAbsent(chave, novo);
            if (destinoAnterior != null) {
                return "No estado \"" + estado + "\" há duas transições lendo o símbolo \""
                        + descreverLeitura(simbolo) + "\": uma vai para \"" + destinoAnterior
                        + "\" e outra para \"" + novo
                        + "\". Numa máquina de Turing determinística, cada estado tem no máximo uma transição para cada símbolo lido.";
            }
        }
        return null;
    }

    private String descreverLeitura(char simbolo) {
        if (simbolo == BRANCO) {
            return "⊔ (branco)";
        }
        return String.valueOf(simbolo);
    }

    /**
     * Converte uma linha do formulário na Transicao do professor e registra
     * na máquina. Os símbolos vêm como String de um caractere; B e ⊔ viram
     * o branco interno 'B'. Direita (D ou R) vira 'D'; esquerda (E ou L) vira 'E'.
     */
    private String adicionarTransicao(MaquinaTuring maquina, TransicaoEntrada entrada, int indice) {
        if (entrada == null) {
            return "A transição " + indice + " está vazia.";
        }

        String estadoInicial = texto(entrada.estadoInicial());
        String novoEstado = texto(entrada.novoEstado());
        String simboloLido = texto(entrada.simboloLido());
        String simboloEscrito = texto(entrada.simboloEscrito());
        String movimento = texto(entrada.movimento()).toUpperCase();

        if (estadoInicial.isEmpty() || novoEstado.isEmpty() || simboloLido.isEmpty()
                || simboloEscrito.isEmpty() || movimento.isEmpty()) {
            return "A transição " + indice
                    + " está incompleta. Preencha estado inicial, símbolo lido, novo estado, símbolo escrito e movimento.";
        }

        String falhaEstado = validarEstado(estadoInicial, "o estado inicial da transição " + indice);
        if (falhaEstado != null) {
            return falhaEstado;
        }
        falhaEstado = validarEstado(novoEstado, "o novo estado da transição " + indice);
        if (falhaEstado != null) {
            return falhaEstado;
        }
        if (simboloLido.length() != 1 || simboloEscrito.length() != 1) {
            return "Na transição " + indice
                    + ", o símbolo lido e o símbolo escrito devem ter exatamente um caractere.";
        }
        if (!movimento.equals("D") && !movimento.equals("E") && !movimento.equals("R") && !movimento.equals("L")) {
            return "Na transição " + indice + ", o movimento deve ser direita (D) ou esquerda (E).";
        }

        char direcao = (movimento.equals("E") || movimento.equals("L")) ? 'E' : 'D';
        maquina.adicionarTransicao(new Transicao(
                estadoInicial,
                normalizarSimbolo(simboloLido),
                novoEstado,
                normalizarSimbolo(simboloEscrito),
                direcao));
        return null;
    }

    /**
     * Separa o alfabeto reconhecido (Σ). Cada símbolo tem de ser um caractere.
     * "0,1", "0;1" e "0, 1" viram {0, 1}. Se não houver vírgula nem ponto e
     * vírgula, os caracteres colados são separados um a um: "01" também é {0, 1}.
     * O branco (B ou ⊔) é recusado, porque ele pertence à fita e não à cadeia.
     */
    private String lerAlfabeto(String bruto, Set<Character> destino) {
        String informado = bruto == null ? "" : bruto.trim().replace('，', ',').replace('；', ',').replace(" ", "");
        if (informado.isEmpty()) {
            return "Informe o alfabeto. Exemplo: 0,1";
        }

        List<String> tokens = new ArrayList<>();
        if (informado.chars().anyMatch(c -> c == ',' || c == ';' || Character.isWhitespace(c))) {
            for (String parte : informado.split("[,;\\s]+")) {
                if (!parte.isEmpty()) {
                    tokens.add(parte);
                }
            }
        } else {
            for (int i = 0; i < informado.length(); i++) {
                tokens.add(informado.substring(i, i + 1));
            }
        }
        if (tokens.isEmpty()) {
            return "Informe o alfabeto. Exemplo: 0,1";
        }

        for (String token : tokens) {
            if (token.length() != 1) {
                return "Cada símbolo do alfabeto deve ter um caractere. \"" + token + "\" não vale. Exemplo: 0,1";
            }
            char simbolo = token.charAt(0);
            if (ehBranco(simbolo)) {
                return "O branco da fita (B ou ⊔) não faz parte do alfabeto reconhecido.";
            }
            if (!destino.add(simbolo)) {
                return "O símbolo \"" + simbolo + "\" está repetido no alfabeto.";
            }
        }
        return null;
    }

    private String validarCadeia(String cadeia, Set<Character> alfabeto) {
        for (int i = 0; i < cadeia.length(); i++) {
            char simbolo = cadeia.charAt(i);
            if (!alfabeto.contains(simbolo)) {
                return "A cadeia contém o símbolo \"" + simbolo
                        + "\", que não pertence ao alfabeto " + formatarAlfabeto(alfabeto) + ".";
            }
        }
        return null;
    }

    private char normalizarSimbolo(String simbolo) {
        char caractere = simbolo.charAt(0);
        if (ehBranco(caractere)) {
            return BRANCO;
        }
        return caractere;
    }

    private boolean ehBranco(char simbolo) {
        return simbolo == BRANCO || simbolo == '⊔' || simbolo == '□' || simbolo == '⌴';
    }

    private String validarEstado(String estado, String papel) {
        return Validacao.validarEstado(estado, papel);
    }

    private String lerEstadosFinais(String texto, Set<String> destino, boolean opcional) {
        return Validacao.lerEstados(texto, destino, opcional,
                "Informe ao menos um estado final de aceitação, como qaceita.");
    }

    private String formatarAlfabeto(Set<Character> alfabeto) {
        return alfabeto.stream().map(String::valueOf).collect(Collectors.joining(", "));
    }

    private String texto(String valor) {
        return Validacao.texto(valor);
    }

    private ResultadoSimulacao erro(String motivo) {
        return new ResultadoSimulacao("erro", false, motivo, "", -1, "", List.of());
    }
}
