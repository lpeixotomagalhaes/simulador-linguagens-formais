package com.br.unifor.simulador.dominio.turing;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Núcleo da máquina de Turing. O laço de executar() é o algoritmo do professor.
 *
 * O que continuou igual:
 * a máquina guarda o estado atual, a fita e uma lista de transições. A cada
 * passo lê o símbolo debaixo do cabeçote, procura na lista a regra daquele
 * estado com aquele símbolo, escreve, move o cabeçote (D direita, E esquerda)
 * e troca o estado. Se o estado atual for final, para e aceita. Se não achar
 * regra, para e rejeita.
 *
 * O que mudou em relação ao código do professor:
 * - O construtor antigo recebia um único estado final, uma String "qf".
 *   Agora recebe dois conjuntos: estadosFinais (aceitam, como qaceita ou
 *   qfinal) e estadosRejeita (rejeitam na hora, como qrejeita). Isso existe
 *   porque a página deixa o usuário escolher o par qaceita/qrejeita ou só
 *   qfinal. No código antigo não havia estado de rejeição explícito.
 * - adicionarTransicao é o mesmo método. No main do professor ele era chamado
 *   na mão, uma linha Java por regra, com símbolos fixos entre aspas. Aqui
 *   quem chama é o SimularMaquinaTuring, num for, com cada linha do quadro de
 *   transições. A lista transicoes começa vazia e só enche com o que veio
 *   da tela.
 * - executar() antes imprimia no console com System.out. Agora devolve um
 *   ResultadoSimulacao (aceita ou rejeita, o motivo, a fita final e a lista
 *   de passos) para a página mostrar na caixa de resultado.
 * - Foi posto um teto de 2000 passos. Sem isso, uma máquina que entra em
 *   laço (por exemplo q0 lendo 0 e voltando para q0 sem andar) nunca
 *   responderia a requisição web.
 * - Duas regras com o mesmo estado e o mesmo símbolo lido: o laço abaixo usa
 *   findFirst(), então ficaria só com a primeira e ignoraria a outra. Isso
 *   não é uma máquina determinística. A recusa acontece antes, em
 *   SimularMaquinaTuring.transicaoRepetida, e a simulação nem começa.
 *
 * |Q| não é um campo desta classe e não é gravado em banco. O conjunto Q é
 *   montado na hora de desenhar, em montarEstados() do DiagramaEstados.jsx, juntando
 *   estado inicial, estados finais e os estados que aparecem nas transições.
 *   |Q| é só o tamanho dessa lista.
 */
public class MaquinaTuring {

    static final int LIMITE_PASSOS = 2000;

    private String estadoAtual;
    private final Set<String> estadosFinais;
    private final Set<String> estadosRejeita;
    private final Fita fita;
    private final List<Transicao> transicoes = new ArrayList<>();

    /**
     * estadoAtual começa no estado inicial escolhido na tela (no exemplo do
     * professor era sempre "q0"). A fita já vem com a cadeia entre brancos.
     */
    public MaquinaTuring(String estadoAtual, Set<String> estadosFinais, Set<String> estadosRejeita, Fita fita) {
        this.estadoAtual = estadoAtual;
        this.estadosFinais = new HashSet<>(estadosFinais);
        this.estadosRejeita = new HashSet<>(estadosRejeita);
        this.fita = fita;
    }

    /**
     * Guarda uma regra δ. No programa do professor cada chamada estava escrita
     * no main. Na aplicação web há uma chamada para cada linha do quadro.
     */
    public void adicionarTransicao(Transicao transicao) {
        transicoes.add(transicao);
    }

    /**
     * Roda a computação até aceitar, rejeitar ou estourar o limite de passos.
     * numero conta quantas regras já foram aplicadas. O passo é anotado antes
     * de escrever e mover, para a página mostrar a fita como ela estava.
     */
    public ResultadoSimulacao executar() {
        List<PassoSimulacao> passos = new ArrayList<>();
        int numero = 0;

        // O laço continua enquanto o estado atual não for de aceitação.
        while (!estadosFinais.contains(estadoAtual)) {
            if (estadosRejeita.contains(estadoAtual)) {
                return resultado(
                        "rejeita",
                        false,
                        "A cadeia foi rejeitada porque a máquina chegou ao estado de rejeição \"" + estadoAtual + "\".",
                        passos);
            }
            if (numero >= LIMITE_PASSOS) {
                return resultado(
                        "rejeita",
                        false,
                        "A cadeia foi rejeitada porque a máquina executou " + LIMITE_PASSOS
                                + " passos sem chegar a um estado final. A computação não termina para essa entrada.",
                        passos);
            }

            char simbolo = fita.ler();
            // Procura a regra (estado atual, símbolo lido). findFirst pega uma só;
            // a configuração já impediu duas regras com o mesmo símbolo.
            Optional<Transicao> transicaoOpt = transicoes.stream()
                    .filter(t -> t.getEstadoAtual().equals(estadoAtual)
                            && t.getSimboloLido() == simbolo)
                    .findFirst();

            if (transicaoOpt.isEmpty()) {
                return resultado(
                        "rejeita",
                        false,
                        "A cadeia foi rejeitada porque não existe transição saindo do estado \""
                                + estadoAtual + "\" ao ler o símbolo \"" + descreverSimbolo(simbolo) + "\".",
                        passos);
            }

            Transicao t = transicaoOpt.get();
            // O passo é registrado antes de aplicar a regra, com a fita ainda no estado anterior.
            passos.add(new PassoSimulacao(
                    numero + 1,
                    estadoAtual,
                    String.valueOf(simbolo),
                    fita.conteudo(),
                    fita.getCabecote(),
                    t.getNovoEstado(),
                    String.valueOf(t.getSimboloEscrito()),
                    String.valueOf(t.getMovimento())));

            fita.escrever(t.getSimboloEscrito());
            fita.mover(t.getMovimento());
            estadoAtual = t.getNovoEstado();
            numero++;
        }

        String motivo = numero == 0
                ? "A cadeia foi aceita porque o estado inicial \"" + estadoAtual + "\" já é um estado final."
                : "A cadeia foi aceita porque a máquina chegou ao estado final \"" + estadoAtual
                        + "\" depois de " + descreverPassos(numero) + ".";

        return resultado("aceita", true, motivo, passos);
    }

    private ResultadoSimulacao resultado(String tipo, boolean aceita, String motivo, List<PassoSimulacao> passos) {
        return new ResultadoSimulacao(
                tipo,
                aceita,
                motivo,
                fita.conteudo(),
                fita.getCabecote(),
                estadoAtual,
                List.copyOf(passos));
    }

    private static String descreverSimbolo(char simbolo) {
        if (simbolo == 'B') {
            return "B (branco)";
        }
        return String.valueOf(simbolo);
    }

    private static String descreverPassos(int numero) {
        if (numero == 1) {
            return "1 transição";
        }
        return numero + " transições";
    }
}
