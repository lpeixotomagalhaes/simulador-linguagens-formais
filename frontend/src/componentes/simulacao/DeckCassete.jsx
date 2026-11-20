/*
 * Toca-fitas da máquina de Turing: fita cassete com dois carretéis, a janela
 * da fita e as teclas ⏮ ◀◀ ◀| ▶/❚❚ |▶ ▶▶ ⏭, mais a velocidade.
 *
 * Os carretéis giram enquanto a fita anda (ao contrário ao rebobinar, mais
 * rápido no avanço rápido) e a fita passa do carretel da esquerda para o da
 * direita conforme os passos avançam. As teclas de modo ficam afundadas
 * enquanto o modo está ativo, como num deck de verdade.
 */
import FitaCassete from "./FitaCassete.jsx";
import useReproducao, { VELOCIDADES } from "../../hooks/useReproducao.js";
import { BRANCO } from "../../utilitarios/simbolos.js";

const visual = (s) => (s === "B" ? BRANCO : s);

function Carretel({ preenchimento, lado }) {
    // Raio do rolo de fita: de 13 (vazio) a 30 (cheio), num carretel de raio 34.
    const raio = 13 + 17 * preenchimento;
    return (
        <svg className={"carretel carretel-" + lado} viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r={raio} className="carretel-rolo" />
            <g className="carretel-giro">
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
            onClick={aoClicar}
            disabled={desabilitada}
            aria-pressed={pressionada === undefined ? undefined : pressionada}
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
    const progresso = total > 1 ? indice / (total - 1) : 0;
    const quadro = quadros[indice];
    const passo = quadro.passo;
    const final = !passo;
    // O deslize dura menos que o intervalo entre passos, para a fita assentar antes do próximo.
    const duracaoFita = Math.round(Math.min(420, r.intervalo * 0.85));
    const giro = r.modo === "tocando" ? `${2.4 / r.velocidade}s` : "0.45s";

    return (
        <section className={`deck deck-${r.modo}`} aria-label="Toca-fitas da máquina de Turing" style={{ "--giro-carretel": giro }}>
            <div className="cassete">
                <div className="cassete-etiqueta">
                    <span className="cassete-lado">MT</span>
                    <span className="cassete-titulo">
                        {final ? "Fim da fita" : `Passo ${indice + 1} de ${total - 1}`}
                    </span>
                    <span className="cassete-estado">estado <strong>{quadro.estado}</strong></span>
                </div>
                <div className="cassete-corpo">
                    <Carretel lado="esq" preenchimento={1 - progresso} />
                    <FitaCassete quadros={quadros} largura={largura} indice={indice} duracaoMs={duracaoFita} />
                    <Carretel lado="dir" preenchimento={progresso} />
                </div>
                <div className="cassete-progresso" aria-hidden="true">
                    <span style={{ transform: `scaleX(${progresso})` }} />
                </div>
            </div>

            <p className="deck-acao" aria-live="polite">
                {final
                    ? <>Configuração final no estado <strong>{quadro.estado}</strong>.</>
                    : <>Em <strong>{passo.estado}</strong>: lê <strong>{visual(passo.simboloLido)}</strong>, escreve{" "}
                        <strong>{visual(passo.simboloEscrito)}</strong>, move para a {passo.movimento === "E" ? "esquerda" : "direita"} e
                        vai para <strong>{passo.novoEstado}</strong>.</>}
            </p>

            <div className="deck-controles">
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
                            onClick={() => r.setVelocidade(v)}
                        >
                            {String(v).replace(".", ",")}×
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
