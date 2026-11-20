package com.br.unifor.simulador_maquina_turing.aplicacao.comum;

import com.br.unifor.simulador_maquina_turing.dominio.comum.Cadeias;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Leitura e validação dos campos que o usuário digita, comum a todos os
 * casos de uso (camada de aplicação).
 *
 * Nasceu dentro do serviço da máquina de Turing e foi separada quando
 * entraram os outros módulos (linguagens, autômato finito, autômato com
 * pilha). Cada método devolve null quando está tudo certo, ou o texto do
 * erro que a página mostra na caixa "Por quê".
 */
public final class Validacao {

    /** Nome de estado: uma letra seguida de letras, números ou _. Exemplo: q0. */
    public static final Pattern ESTADO = Pattern.compile("[A-Za-z][A-Za-z0-9_]*");

    /** Palavra vazia. λ é o símbolo usado na disciplina; ε e a palavra "lambda" também valem. */
    public static final String LAMBDA = Cadeias.LAMBDA;

    private Validacao() {
    }

    public static String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    public static boolean ehLambda(String simbolo) {
        String s = texto(simbolo);
        return s.isEmpty() || s.equals("λ") || s.equals("ε") || s.equalsIgnoreCase("lambda");
    }

    public static String validarEstado(String estado, String papel) {
        if (estado.isEmpty()) {
            return "Informe " + papel + ".";
        }
        if (!ESTADO.matcher(estado).matches()) {
            return "O valor \"" + estado + "\" não serve para " + papel
                    + ". Use uma letra seguida de letras, números ou _. Exemplo: q0.";
        }
        return null;
    }

    /**
     * Lê uma lista de estados separados por vírgula, ponto e vírgula ou espaço.
     * Se opcional for falso e a lista vier vazia, devolve a mensagem de falta.
     */
    public static String lerEstados(String texto, Set<String> destino, boolean opcional, String mensagemFalta) {
        if (texto != null) {
            for (String parte : texto.split("[,;\\s]+")) {
                if (parte.isBlank()) {
                    continue;
                }
                String estado = parte.trim();
                String falha = validarEstado(estado, "um estado final");
                if (falha != null) {
                    return falha;
                }
                destino.add(estado);
            }
        }
        if (destino.isEmpty() && !opcional) {
            return mensagemFalta;
        }
        return null;
    }

    /**
     * Separa um alfabeto em símbolos de um caractere. "0,1", "0;1", "0, 1" e
     * "01" viram {0, 1}. λ é recusado: a palavra vazia não é símbolo.
     */
    public static String lerAlfabeto(String bruto, Set<Character> destino, String exemplo) {
        String informado = bruto == null ? "" : bruto.trim()
                .replace('，', ',').replace('；', ',').replace("{", "").replace("}", "").replace(" ", "");
        if (informado.isEmpty()) {
            return "Informe o alfabeto. Exemplo: " + exemplo;
        }
        List<String> tokens = new ArrayList<>();
        if (informado.indexOf(',') >= 0 || informado.indexOf(';') >= 0) {
            for (String parte : informado.split("[,;]+")) {
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
            return "Informe o alfabeto. Exemplo: " + exemplo;
        }
        for (String token : tokens) {
            if (token.length() != 1) {
                return "Cada símbolo do alfabeto deve ter um caractere. \"" + token + "\" não vale. Exemplo: " + exemplo;
            }
            if (ehLambda(token)) {
                return "λ (ε) representa a palavra vazia e não pode ser símbolo do alfabeto.";
            }
            if (!destino.add(token.charAt(0))) {
                return "O símbolo \"" + token + "\" está repetido no alfabeto.";
            }
        }
        return null;
    }

    /** Confere se todo caractere da cadeia está no alfabeto. */
    public static String validarCadeia(String cadeia, Set<Character> alfabeto) {
        for (int i = 0; i < cadeia.length(); i++) {
            char simbolo = cadeia.charAt(i);
            if (!alfabeto.contains(simbolo)) {
                return "A cadeia contém o símbolo \"" + simbolo
                        + "\", que não pertence ao alfabeto " + formatar(alfabeto) + ".";
            }
        }
        return null;
    }

    public static String formatar(Collection<?> itens) {
        return Cadeias.formatar(itens);
    }

    /** Cadeia como aparece na tela: a vazia vira λ. */
    public static String mostrar(String cadeia) {
        return Cadeias.mostrar(cadeia);
    }
}
