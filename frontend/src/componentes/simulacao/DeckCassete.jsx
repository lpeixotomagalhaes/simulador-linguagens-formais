/*
 * Toca-fitas da máquina de Turing, em três faixas, como uma fita cassete:
 *
 *   etiqueta  estado atual e a regra sendo aplicada (lê → escreve, sentido);
 *   corpo     dois carretéis e a janela da fita, com o cabeçote fixo no meio;
 *   base      as teclas ⏮ ◀◀ ◀| ▶/❚❚ |▶ ▶▶ ⏭ e a velocidade, entre os furos de guia.
 *
 * O histórico é a lista de quadros que a API devolveu (um retrato da fita,
 * do cabeçote e do estado por passo): voltar um passo só mostra o quadro
 * anterior, nunca "desfaz" a máquina. A cada passo os carretéis giram junto
 * com a fita: cabeçote para a direita, fita para a esquerda, carretéis no
 * sentido horário; para a esquerda, anti-horário. A quantidade de fita em
 * cada carretel acompanha a posição do cabeçote. Teclas fazem um clique e
 * cada passo um zumbido de motor (sons sintetizados, desligáveis no botão de
 * alto-falante do cabeçalho).
 */
import { useEffect, useRef, useState } from "react";
import FitaCassete from "./FitaCassete.jsx";
import useReproducao, { VELOCIDADES } from "../../hooks/useReproducao.js";
import { BRANCO } from "../../utilitarios/simbolos.js";
import { tocarClique, tocarMotor } from "../../utilitarios/sonsDoDeck.js";

const visual = (s) => (s === "B" ? BRANCO : s);
const GRAUS_POR_CELULA = 72;

function Carretel({ preenchimento, angulo, lado }) {
    // Raio do rolo de fita: de 13 (vazio) a 30 (cheio), num carretel de raio 34.
    const raio = 13 + 17 * preenchimento;
    return (
        <svg className={"carretel carretel-" + lado} viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r={raio} className="carretel-rolo" />
            <g className="carretel-giro" style={{ transform: `rotate(${angulo}deg)` }}>
                <circle cx="40" cy="40" r="34" className="carretel-aro" />
                <circle cx="40" cy="40" r="10" className="carretel-cubo" />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                    <rect key={a} x="38.5" y="22" width="3" height="9" rx="1.5" className="carretel-dente" transform={`rotate(${a} 40 40)`} />
                ))}
            </g>
        </svg>
    );
}

function Tecla({ rotulo, titulo, aoClicar, pressionada, desabilitada, destaque }) {
    return (
        <button
            type="button"
            className={"tecla" + (destaque ? " tecla-play" : "")}
            onClick={() => {
                tocarClique();
                aoClicar();
            }}
            disabled={desabilitada}
            aria-pressed={pressionada}
            title={titulo}
            aria-label={titulo}
        >
            {rotulo}
        </button>
    );
}

export default function DeckCassete({ quadros, largura, indice, aoMudar }) {
    const total = quadros.length;
    const r = useReproducao(total, indice, aoMudar);
    const quadro = quadros[indice];
    const passo = quadro.passo;
    const final = !passo;
    // O deslize dura menos que o intervalo entre passos, para a fita assentar antes do próximo.
    const duracaoFita = Math.round(Math.min(420, r.intervalo * 0.85));

    // Giro dos carretéis acumulado, no sentido em que a fita andou.
    const [angulo, setAngulo] = useState(0);
    const anterior = useRef(quadro);
    useEffect(() => {
        const antes = anterior.current;
        anterior.current = quadro;
        if (antes === quadro) return;
        const delta = quadro.cabecoteGlobal - antes.cabecoteGlobal;
        const celulas = Math.max(1, Math.min(6, Math.abs(delta)));
        setAngulo((a) => a + Math.sign(delta || 1) * celulas * GRAUS_POR_CELULA);
        tocarMotor(duracaoFita);
    }, [quadro, duracaoFita]);

    // Fita no carretel da esquerda = parte à esquerda do cabeçote.
    const posicao = largura > 1 ? quadro.cabecoteGlobal / (largura - 1) : 0;
    const regra = final
        ? `fim da fita · ${quadro.estado}`
        : `lê ${visual(passo.simboloLido)} → escreve ${visual(passo.simboloEscrito)} · ${passo.movimento === "E" ? "←" : "→"}`;

    return (
        <section className={`deck deck-${r.modo}`} aria-label="Toca-fitas da máquina de Turing"
            style={{ "--duracao-fita": `${duracaoFita}ms` }}>
            <div className="cassete">
                <div className="cassete-etiqueta">
                    <span className="cassete-lado">MT</span>
                    <span key={quadro.estado} className="cassete-estado">{quadro.estado}</span>
                    <span className="cassete-regra">{regra}</span>
                    <span className="cassete-passo">{final ? `${total - 1}/${total - 1}` : `${indice + 1}/${total - 1}`}</span>
                </div>

                <div className="cassete-corpo">
                    <Carretel lado="esq" preenchimento={posicao} angulo={angulo} />
                    <FitaCassete quadros={quadros} largura={largura} indice={indice} duracaoMs={duracaoFita} />
                    <Carretel lado="dir" preenchimento={1 - posicao} angulo={angulo} />
                </div>

                <div className="cassete-progresso" aria-hidden="true">
                    <span style={{ transform: `scaleX(${total > 1 ? indice / (total - 1) : 0})` }} />
                </div>

                <div className="cassete-base">
                    <span className="cassete-furo" aria-hidden="true" />
                    <div className="deck-teclas" role="group" aria-label="Controles da fita">
                        <Tecla rotulo="⏮" titulo="Voltar ao início" aoClicar={r.inicio} desabilitada={indice === 0} />
                        <Tecla rotulo="◀◀" titulo="Rebobinar" aoClicar={r.rebobinar} pressionada={r.modo === "rebobinando"} desabilitada={indice === 0 && r.modo !== "rebobinando"} />
                        <Tecla rotulo="◀|" titulo="Passo anterior" aoClicar={r.passoTras} desabilitada={indice === 0} />
                        <Tecla
                            rotulo={r.modo === "tocando" ? "❚❚" : "▶"}
                            titulo={r.modo === "tocando" ? "Pausar" : "Reproduzir"}
                            aoClicar={r.alternarPlay}
                            pressionada={r.modo === "tocando"}
                            destaque
                        />
                        <Tecla rotulo="|▶" titulo="Próximo passo" aoClicar={r.passoFrente} desabilitada={final} />
                        <Tecla rotulo="▶▶" titulo="Avançar rápido" aoClicar={r.avancar} pressionada={r.modo === "avancando"} desabilitada={final && r.modo !== "avancando"} />
                        <Tecla rotulo="⏭" titulo="Ir para o fim" aoClicar={r.fim} desabilitada={final} />
                    </div>
                    <div className="deck-velocidade" role="group" aria-label="Velocidade">
                        {VELOCIDADES.map((v) => (
                            <button
                                key={v}
                                type="button"
                                className={"velocidade" + (r.velocidade === v ? " ativa" : "")}
                                aria-pressed={r.velocidade === v}
                                onClick={() => {
                                    tocarClique();
                                    r.setVelocidade(v);
                                }}
                            >
                                {String(v).replace(".", ",")}×
                            </button>
                        ))}
                    </div>
                    <span className="cassete-furo" aria-hidden="true" />
                </div>
            </div>

            {/* A frase completa do passo, para leitores de tela. */}
            <p className="sr-only" aria-live="polite">
                {final
                    ? `Configuração final no estado ${quadro.estado}.`
                    : `Em ${passo.estado}: lê ${visual(passo.simboloLido)}, escreve ${visual(passo.simboloEscrito)}, move para a ${passo.movimento === "E" ? "esquerda" : "direita"} e vai para ${passo.novoEstado}.`}
            </p>
        </section>
    );
}
