package com.br.unifor.simulador_maquina_turing.dominio.pilha;

import com.br.unifor.simulador_maquina_turing.dominio.comum.Cadeias;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Autômato com pilha (possivelmente não determinístico).
 *
 * Configuração = (estado, posição na entrada, conteúdo da pilha). A pilha
 * é uma String com o topo no índice 0: empilhar "AZ" é prefixar "AZ";
 * desempilhar X é tirar o primeiro caractere se ele for X.
 *
 * Simulação: busca em largura sobre as configurações. De cada uma saem
 * todas as transições aplicáveis (as que leem o próximo símbolo e as que
 * leem λ). Configurações repetidas são descartadas. Para não entrar em
 * laço com transições λ que só empilham, a pilha tem altura máxima e há
 * um teto de configurações exploradas.
 */
public class AutomatoPilha {

    static final int LIMITE_CONFIGURACOES = 100_000;

    /** δ(origem, le, desempilha) = (destino, empilha). "" representa λ. */
    public record Regra(String origem, String le, String desempilha, String destino, String empilha) {
        String descrever() {
            return "δ(" + origem + ", " + Cadeias.mostrar(le) + ", " + Cadeias.mostrar(desempilha) + ") = ("
                    + destino + ", " + Cadeias.mostrar(empilha) + ")";
        }
    }

    private record Config(String estado, int posicao, String pilha, Config pai, Regra regra, int profundidade) {
        String chave() {
            return estado + "\0" + posicao + "\0" + pilha;
        }
    }

    private final String inicial;
    private final char simboloPilha;
    private final Set<String> finais;
    private final boolean porPilhaVazia;
    private final List<Regra> regras = new ArrayList<>();

    public AutomatoPilha(String inicial, char simboloPilha, Set<String> finais, boolean porPilhaVazia) {
        this.inicial = inicial;
        this.simboloPilha = simboloPilha;
        this.finais = finais;
        this.porPilhaVazia = porPilhaVazia;
    }

    public void adicionarRegra(Regra regra) {
        regras.add(regra);
    }

    public PilhaResultado executar(String w) {
        int alturaMaxima = 2 * w.length() + 10;
        Deque<Config> fila = new ArrayDeque<>();
        Set<String> vistas = new HashSet<>();
        Config raiz = new Config(inicial, 0, String.valueOf(simboloPilha), null, null, 0);
        fila.add(raiz);
        vistas.add(raiz.chave());
        Config melhor = raiz;
        int exploradas = 0;
        boolean cortouAltura = false;

        while (!fila.isEmpty()) {
            Config c = fila.poll();
            exploradas++;
            if (c.posicao() > melhor.posicao()
                    || (c.posicao() == melhor.posicao() && c.profundidade() > melhor.profundidade())) {
                melhor = c;
            }
            if (aceita(c, w)) {
                String motivo = porPilhaVazia
                        ? "ACEITA: a entrada foi lida até o fim e a pilha ficou vazia (aceitação por pilha vazia)."
                        : "ACEITA: a entrada foi lida até o fim e o autômato está no estado final \"" + c.estado() + "\".";
                return new PilhaResultado("aceita", true, motivo, montarPassos(c, w), exploradas);
            }
            if (exploradas >= LIMITE_CONFIGURACOES) {
                return new PilhaResultado("rejeita", false,
                        "REJEITA por limite: foram exploradas " + LIMITE_CONFIGURACOES
                                + " configurações sem aceitar. O autômato pode ter laços de transições λ.",
                        montarPassos(melhor, w), exploradas);
            }
            for (Regra r : regras) {
                if (!r.origem().equals(c.estado())) {
                    continue;
                }
                if (!r.le().isEmpty() && (c.posicao() >= w.length() || w.charAt(c.posicao()) != r.le().charAt(0))) {
                    continue;
                }
                if (!r.desempilha().isEmpty() && !c.pilha().startsWith(r.desempilha())) {
                    continue;
                }
                String pilha = r.empilha() + c.pilha().substring(r.desempilha().length());
                if (pilha.length() > alturaMaxima) {
                    cortouAltura = true;
                    continue;
                }
                Config nova = new Config(r.destino(), c.posicao() + r.le().length(), pilha, c, r, c.profundidade() + 1);
                if (vistas.add(nova.chave())) {
                    fila.add(nova);
                }
            }
        }

        StringBuilder motivo = new StringBuilder("REJEITA: nenhuma sequência de transições ");
        motivo.append(porPilhaVazia ? "lê a cadeia toda e esvazia a pilha." : "lê a cadeia toda e termina em estado final.");
        if (melhor.posicao() < w.length()) {
            motivo.append(" O caminho que mais avançou parou no estado \"").append(melhor.estado())
                    .append("\" antes de ler o símbolo \"").append(w.charAt(melhor.posicao()))
                    .append("\" (posição ").append(melhor.posicao() + 1).append("), com a pilha ")
                    .append(Cadeias.mostrar(melhor.pilha())).append(".");
        } else {
            motivo.append(" A entrada foi lida, mas o autômato terminou no estado \"").append(melhor.estado())
                    .append("\" com a pilha ").append(Cadeias.mostrar(melhor.pilha())).append(".");
        }
        if (cortouAltura) {
            motivo.append(" (Caminhos com pilha maior que ").append(alturaMaxima).append(" símbolos foram descartados.)");
        }
        return new PilhaResultado("rejeita", false, motivo.toString(), montarPassos(melhor, w), exploradas);
    }

    private boolean aceita(Config c, String w) {
        if (c.posicao() != w.length()) {
            return false;
        }
        return porPilhaVazia ? c.pilha().isEmpty() : finais.contains(c.estado());
    }

    private List<PilhaResultado.Passo> montarPassos(Config fim, String w) {
        List<Config> caminho = new ArrayList<>();
        for (Config c = fim; c != null; c = c.pai()) {
            caminho.add(c);
        }
        Collections.reverse(caminho);
        List<PilhaResultado.Passo> passos = new ArrayList<>();
        for (int i = 0; i < caminho.size(); i++) {
            Config c = caminho.get(i);
            String lido = c.regra() == null ? "" : Cadeias.mostrar(c.regra().le());
            passos.add(new PilhaResultado.Passo(
                    i,
                    c.estado(),
                    lido,
                    Cadeias.mostrar(w.substring(c.posicao())),
                    c.pilha(),
                    c.regra() == null ? "configuração inicial" : c.regra().descrever()));
        }
        return passos;
    }
}
