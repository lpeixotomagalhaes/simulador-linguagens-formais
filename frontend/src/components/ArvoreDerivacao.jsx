/*
 * Árvore de derivação da GLC em SVG.
 *
 * Layout simples em camadas: cada folha ocupa uma coluna, da esquerda para
 * a direita (assim a leitura das folhas é a própria cadeia), e cada nó
 * interno fica centralizado sobre os filhos. A profundidade dá a linha.
 */
const LARGURA_COLUNA = 46;
const ALTURA_NIVEL = 64;
const MARGEM = 30;

function dispor(no, profundidade, contador, saida) {
    const filhos = (no.filhos || []).map((f) => dispor(f, profundidade + 1, contador, saida));
    let x;
    if (filhos.length === 0) {
        x = MARGEM + contador.coluna * LARGURA_COLUNA;
        contador.coluna += 1;
    } else {
        x = (filhos[0].x + filhos[filhos.length - 1].x) / 2;
    }
    const item = { no, x, y: MARGEM + profundidade * ALTURA_NIVEL, filhos };
    saida.push(item);
    return item;
}

export default function ArvoreDerivacao({ arvore }) {
    if (!arvore) {
        return null;
    }
    const todos = [];
    const contador = { coluna: 0 };
    dispor(arvore, 0, contador, todos);
    const largura = Math.max(2 * MARGEM + (contador.coluna - 1) * LARGURA_COLUNA, 120);
    const altura = Math.max(...todos.map((n) => n.y)) + MARGEM;

    return (
        <div className="diagrama arvore">
            <svg className="diagrama-svg" width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label="Árvore de derivação">
                {todos.flatMap((item) =>
                    item.filhos.map((filho, i) => (
                        <line key={`${item.x}-${item.y}-${i}`} x1={item.x} y1={item.y + 14} x2={filho.x} y2={filho.y - 14} className="diag-traco" strokeWidth={1.3} />
                    ))
                )}
                {todos.map((item, i) => (
                    <g key={i} className={item.no.variavel ? "arvore-var" : "arvore-term"}>
                        <circle cx={item.x} cy={item.y} r={15} className="diag-circulo" strokeWidth={item.no.variavel ? 1.7 : 1} />
                        <text x={item.x} y={item.y + 5} textAnchor="middle" fontSize={16} className="diag-nome" fontFamily="Palatino Linotype, Georgia, serif">
                            {item.no.simbolo}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
