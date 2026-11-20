/*
 * Peças pequenas repetidas em todos os módulos: campo com rótulo, caixa de
 * resultado, navegação passo a passo, fita, pilha e descrição formal.
 */
import { useEffect, useId, useState } from "react";
import CountUp from "./reactbits/CountUp.jsx";

export const LAMBDA = "λ";
export const BRANCO = "⊔";

export function Campo({ rotulo, valor, aoMudar, placeholder, erro, dica, largo, mono, ...resto }) {
    return (
        <label className={largo ? "largo" : undefined}>
            {rotulo}
            <input
                value={valor}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck={false}
                className={[erro ? "invalido" : "", mono ? "mono" : ""].join(" ").trim() || undefined}
                aria-invalid={erro ? "true" : undefined}
                onChange={(e) => aoMudar(e.target.value)}
                {...resto}
            />
            {erro && <span className="erro-campo">{erro}</span>}
            {dica && !erro && <span className="dica-campo">{dica}</span>}
        </label>
    );
}

export function Quadro({ titulo, descricao, acoes, children, className = "" }) {
    return (
        <section className={"quadro " + className}>
            {(titulo || acoes) && (
                <div className="quadro-cabeca">
                    <div>
                        {titulo && <h2>{titulo}</h2>}
                        {descricao && <p>{descricao}</p>}
                    </div>
                    {acoes && <div className="quadro-acoes">{acoes}</div>}
                </div>
            )}
            {children}
        </section>
    );
}

export function Exemplos({ exemplos, aoEscolher }) {
    return (
        <div className="exemplos">
            <span className="exemplos-rotulo">Carregar exemplo:</span>
            {exemplos.map((ex) => (
                <button type="button" key={ex.nome} className="chip" onClick={() => aoEscolher(ex)} title={ex.descricao}>
                    {ex.nome}
                </button>
            ))}
        </div>
    );
}

const TITULOS = { aceita: "Aceita", rejeita: "Rejeita", erro: "Configuração inválida" };

/*
 * Ícone do resultado desenhado com traço (padrões "Success check" e
 * "Checkbox check" do transitions.dev): o caminho se desenha uma vez quando
 * o resultado chega. ✓ aceita, ✕ rejeita, ! erro de configuração.
 */
function IconeResultado({ tipo }) {
    const caminhos = {
        aceita: ["M7 12.5l3.2 3.2L17 9"],
        rejeita: ["M8.5 8.5l7 7", "M15.5 8.5l-7 7"],
        erro: ["M12 7.5v5.5", "M12 16.4v.1"]
    }[tipo] || [];
    return (
        <svg className="icone-resultado" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" className="icone-aro" />
            {caminhos.map((d, i) => (
                <path key={i} d={d} className="icone-traco" style={{ animationDelay: `${180 + i * 90}ms` }} pathLength="1" />
            ))}
        </svg>
    );
}

/*
 * Caixa de resultado. A cada nova resposta ela entra de novo (fade curto,
 * "Panel reveal"); erro de configuração treme uma vez ("Error state shake").
 * O pai passa uma `chave` diferente a cada execução para reiniciar a entrada.
 */
export function CaixaResultado({ dados, titulos = TITULOS, children }) {
    const [execucao, setExecucao] = useState(0);
    useEffect(() => {
        if (dados) setExecucao((n) => n + 1);
    }, [dados]);

    if (!dados) {
        return null;
    }
    const tipo = dados.tipo || "erro";
    return (
        <section key={execucao} className={"resultado entra " + tipo} aria-live="polite">
            <p className="etiqueta">Resultado</p>
            <h2 className="status">
                <IconeResultado tipo={tipo} />
                {titulos[tipo] || TITULOS[tipo]}
            </h2>
            <p className="motivo">{dados.motivo}</p>
            {tipo !== "erro" && children}
        </section>
    );
}

/* Número de resultado que rola até o valor (CountUp do React Bits, modo "roll"). */
export function Numero({ valor }) {
    if (typeof valor !== "number" || Number.isNaN(valor)) {
        return <>{valor ?? "—"}</>;
    }
    return <CountUp key={valor} to={valor} mode="roll" duration={0.9} trigger="load" />;
}

/*
 * Seção que abre e fecha ("Accordion" do transitions.dev): altura animada por
 * grid-template-rows 0fr → 1fr e chevron que gira. O conteúdo continua no
 * DOM, então o que foi digitado nele não se perde.
 */
export function Sanfona({ titulo, children, abertaInicial = false }) {
    const [aberta, setAberta] = useState(abertaInicial);
    const id = useId();
    return (
        <div className={"sanfona" + (aberta ? " aberta" : "")}>
            <button type="button" className="sanfona-botao" aria-expanded={aberta} aria-controls={id} onClick={() => setAberta(!aberta)}>
                <svg className="sanfona-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 6.5l3 3 3-3" /></svg>
                {titulo}
            </button>
            <div className="sanfona-corpo" id={id} inert={aberta ? undefined : ""}>
                <div className="sanfona-conteudo">{children}</div>
            </div>
        </div>
    );
}

/*
 * Navegação entre os passos de uma simulação. "Reproduzir" avança sozinho,
 * útil na apresentação. O pai guarda o índice para destacar o diagrama.
 */
export function PassoAPasso({ total, indice, aoMudar, rotulo }) {
    const [tocando, setTocando] = useState(false);

    useEffect(() => {
        if (!tocando) {
            return undefined;
        }
        if (indice >= total - 1) {
            setTocando(false);
            return undefined;
        }
        const t = setTimeout(() => aoMudar(indice + 1), 700);
        return () => clearTimeout(t);
    }, [tocando, indice, total, aoMudar]);

    if (total <= 0) {
        return null;
    }
    const ir = (i) => {
        setTocando(false);
        aoMudar(Math.max(0, Math.min(total - 1, i)));
    };
    return (
        <div className="passo-a-passo">
            <div className="passo-botoes">
                <button type="button" onClick={() => ir(0)} disabled={indice === 0} aria-label="Primeiro passo">⏮</button>
                <button type="button" onClick={() => ir(indice - 1)} disabled={indice === 0} aria-label="Passo anterior">◀</button>
                <button
                    type="button"
                    className="tocar"
                    onClick={() => {
                        if (indice >= total - 1) {
                            aoMudar(0);
                        }
                        setTocando(!tocando);
                    }}
                >
                    {tocando ? "❚❚ Pausar" : "▶ Reproduzir"}
                </button>
                <button type="button" onClick={() => ir(indice + 1)} disabled={indice >= total - 1} aria-label="Próximo passo">▶</button>
                <button type="button" onClick={() => ir(total - 1)} disabled={indice >= total - 1} aria-label="Último passo">⏭</button>
            </div>
            <span className="passo-contador">
                {rotulo ?? "Passo"}{" "}
                <span key={indice} className="numero-troca">{indice}</span> de {total - 1}
            </span>
        </div>
    );
}

/* Fita: cadeia em células, com o cabeçote destacado. Usada por MT e AP. */
export function Fita({ simbolos, cabecote, consumidos }) {
    return (
        <div className="fita" role="list">
            {simbolos.map((s, i) => {
                const classes = ["celula"];
                if (i === cabecote) classes.push("atual");
                if (consumidos !== undefined && i < consumidos) classes.push("lida");
                return (
                    <span key={i} className={classes.join(" ")} role="listitem">
                        {s}
                    </span>
                );
            })}
            {simbolos.length === 0 && <span className="celula vazia">{LAMBDA}</span>}
        </div>
    );
}

/* Pilha vertical, topo em cima. A String da API tem o topo no índice 0. */
export function Pilha({ conteudo }) {
    const itens = [...(conteudo || "")];
    return (
        <div className="pilha" aria-label={"Pilha: " + (itens.join("") || "vazia")}>
            <span className="pilha-topo">topo</span>
            {itens.length === 0 && <div className="pilha-item vazia">vazia</div>}
            {itens.map((s, i) => (
                <div key={i} className={"pilha-item" + (i === 0 ? " topo" : "")}>{s}</div>
            ))}
            <div className="pilha-base" />
        </div>
    );
}

export function DescricaoFormal({ tupla, itens }) {
    return (
        <div className="descricao">
            <p className="tupla">{tupla}</p>
            <div className="descricao-grade">
                {itens.map(([simbolo, legenda]) => (
                    <div className="bloco-formal" key={legenda}>
                        <p className="simbolo-formal">{simbolo}</p>
                        <p className="legenda-formal">{legenda}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function conjunto(lista) {
    return "{" + lista.join(", ") + "}";
}

/* Alfabeto como na API: "a,b", "a, b" ou "ab". Devolve a lista de símbolos. */
export function lerAlfabeto(texto) {
    const bruto = (texto || "").replace(/[{}\s]/g, "").replace(/[，；;]/g, ",");
    if (!bruto) return [];
    const tokens = bruto.includes(",") ? bruto.split(",").filter(Boolean) : [...bruto];
    return [...new Set(tokens)];
}

export function ehLambda(s) {
    const t = (s || "").trim();
    return t === "" || t === "λ" || t === "ε" || t.toLowerCase() === "lambda";
}
