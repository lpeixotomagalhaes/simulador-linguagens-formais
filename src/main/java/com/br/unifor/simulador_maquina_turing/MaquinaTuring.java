package com.br.unifor.simulador_maquina_turing;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Executa a máquina de Turing determinística do professor.
 *
 * A cada passo a máquina está num estado e o cabeçote está sobre um símbolo.
 * Ela procura a única transição daquele par, escreve o símbolo novo, move o
 * cabeçote e troca de estado. Isso se repete até acontecer um destes casos:
 *
 * 1. O estado atual está em estadosFinais (qaceita ou qfinal): a cadeia é aceita.
 * 2. O estado atual está em estadosRejeita (qrejeita): a cadeia é rejeitada na hora.
 * 3. Não existe transição para o símbolo lido: a cadeia é rejeitada.
 * 4. Passaram 2000 passos sem parar: a computação não termina e a cadeia é rejeitada.
 *
 * A quantidade de estados (Q) não é guardada nesta classe. Quem precisa de |Q|
 * monta o conjunto na tela, em modeloAtual() no diagrama.js.
 */
public class MaquinaTuring {

    static final int LIMITE_PASSOS = 2000;

    private String estadoAtual;
    private final Set<String> estadosFinais;
    private final Set<String> estadosRejeita;
    private final Fita fita;
    private final List<Transicao> transicoes = new ArrayList<>();

    public MaquinaTuring(String estadoAtual, Set<String> estadosFinais, Set<String> estadosRejeita, Fita fita) {
        this.estadoAtual = estadoAtual;
        this.estadosFinais = new HashSet<>(estadosFinais);
        this.estadosRejeita = new HashSet<>(estadosRejeita);
        this.fita = fita;
    }

    public void adicionarTransicao(Transicao transicao) {
        transicoes.add(transicao);
    }

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
            // findFirst basta porque a configuração já recusou duas regras com o mesmo símbolo lido.
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
