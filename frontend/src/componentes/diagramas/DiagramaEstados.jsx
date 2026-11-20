/*
 * Diagrama de estados genérico, usado por AF, AP e MT.
 *
 * Porta para React da geometria que existia em static/js/diagrama.js do
 * simulador de Turing: estados numa elipse (o inicial à esquerda), setas
 * curvadas para fora do centro para não atravessar os círculos, laço do
 * lado de fora do próprio estado, contorno duplo nos estados finais e uma
 * seta de entrada no inicial. Rótulos que ligam o mesmo par de estados são
 * empilhados numa só seta.
 *
 * Props
 *   estados    lista de nomes (ordem de desenho)
 *   inicial    nome do estado inicial
 *   finais     estados de aceitação (contorno duplo)
 *   rejeicao   estados de rejeição (contorno tracejado)
 *   arestas    [{ de, para, rotulo }]
 *   ativos     estados destacados no passo atual da simulação
 *   arestaAtiva { de, para } da transição sendo aplicada: fica em destaque,
 *              com traços correndo no sentido da seta
 */
import { useId } from "react";

const FONTE = "Palatino Linotype, Georgia, Segoe UI Symbol, Segoe UI, sans-serif";

function posicionar(estados) {
    const quantidade = estados.length;
    const raio = quantidade <= 1 ? 0 : Math.max(150, quantidade * 42);
    const centro = { x: raio + 180, y: raio * 0.78 + 130 };
    const nos = estados.map((id, indice) => {
        const angulo = Math.PI + (2 * Math.PI * indice) / Math.max(quantidade, 1);
        const rx = Math.max(34, Math.min(64, 18 + id.length * 5.4));
        return {
            id,
            x: centro.x + Math.cos(angulo) * raio,
            y: centro.y + Math.sin(angulo) * raio * 0.78,
            rx,
            ry: 30
        };
    });
    return { centro, nos };
}

function pontoNaBorda(no, alvoX, alvoY) {
    const angulo = Math.atan2(alvoY - no.y, alvoX - no.x);
    return {
        x: no.x + Math.cos(angulo) * (no.rx + 2),
        y: no.y + Math.sin(angulo) * (no.ry + 2)
    };
}

function Rotulo({ x, y, linhas }) {
    return (
        <text
            x={x}
            y={y - ((linhas.length - 1) * 16) / 2}
            textAnchor="middle"
            fontFamily={FONTE}
            fontSize={15}
            className="diag-rotulo"
            paintOrder="stroke"
            strokeWidth={5}
        >
            {linhas.map((linha, i) => (
                <tspan key={i} x={x} dy={i === 0 ? 0 : 16}>{linha}</tspan>
            ))}
        </text>
    );
}

function Aresta({ origem, destino, rotulos, centro, seta, lacoInicial }) {
    if (origem.id === destino.id) {
        const dx = origem.x - centro.x;
        const dy = origem.y - centro.y;
        const comprimento = Math.hypot(dx, dy);
        // Estado único (sem centro): o laço vai para cima. Estado inicial: para
        // baixo, para não bater na seta de entrada, que chega pela esquerda,
        // nem nas setas que saem para a metade de cima da elipse.
        const unico = comprimento < 1e-6;
        const vertical = unico || lacoInicial;
        const ux = vertical ? 0 : dx / comprimento;
        const uy = unico ? -1 : lacoInicial ? 1 : dy / comprimento;
        const saida = { x: origem.x + ux * origem.rx - uy * 8, y: origem.y + uy * origem.ry + ux * 8 };
        const chegada = { x: origem.x + ux * origem.rx + uy * 8, y: origem.y + uy * origem.ry - ux * 8 };
        const controle = { x: origem.x + ux * (origem.rx + 58), y: origem.y + uy * (origem.ry + 58) };
        const d = `M ${saida.x} ${saida.y} C ${controle.x - uy * 26} ${controle.y + ux * 26}, ${controle.x + uy * 26} ${controle.y - ux * 26}, ${chegada.x} ${chegada.y}`;
        return (
            <g>
                <path d={d} fill="none" className="diag-traco" strokeWidth={1.6} markerEnd={`url(#${seta})`} />
                {lacoInicial && !unico ? (
                    // Laço do estado inicial (para baixo): rótulo à esquerda do laço,
                    // longe das setas que descem para os estados vizinhos.
                    <Rotulo x={controle.x - 34 - Math.max(...rotulos.map((r) => r.length)) * 3} y={controle.y - 18} linhas={rotulos} />
                ) : (
                    <Rotulo x={controle.x + ux * 16} y={controle.y + uy * 16 - (uy < 0 ? (rotulos.length - 1) * 8 : 0)} linhas={rotulos} />
                )}
            </g>
        );
    }

    const inicio = pontoNaBorda(origem, destino.x, destino.y);
    const fim = pontoNaBorda(destino, origem.x, origem.y);
    const meioX = (inicio.x + fim.x) / 2;
    const meioY = (inicio.y + fim.y) / 2;
    let foraX = meioX - centro.x;
    let foraY = meioY - centro.y;
    let distancia = Math.hypot(foraX, foraY);
    if (distancia < 1) {
        // Seta que passa pelo centro: curva para a perpendicular da reta.
        foraX = -(fim.y - inicio.y);
        foraY = fim.x - inicio.x;
        distancia = Math.hypot(foraX, foraY) || 1;
    }
    const controleX = meioX + (foraX / distancia) * 54;
    const controleY = meioY + (foraY / distancia) * 54;
    const rotuloX = (inicio.x + 2 * controleX + fim.x) / 4;
    const rotuloY = (inicio.y + 2 * controleY + fim.y) / 4;
    const empurraX = rotuloX - centro.x;
    const empurraY = rotuloY - centro.y;
    const empurra = Math.hypot(empurraX, empurraY) || 1;
    return (
        <g>
            <path
                d={`M ${inicio.x} ${inicio.y} Q ${controleX} ${controleY} ${fim.x} ${fim.y}`}
                fill="none"
                className="diag-traco"
                strokeWidth={1.6}
                markerEnd={`url(#${seta})`}
            />
            <Rotulo x={rotuloX + (empurraX / empurra) * 14} y={rotuloY + (empurraY / empurra) * 14} linhas={rotulos} />
        </g>
    );
}

export default function DiagramaEstados({
    estados,
    inicial,
    finais = [],
    rejeicao = [],
    arestas = [],
    ativos = [],
    arestaAtiva = null,
    rotuloAria = "Diagrama de estados"
}) {
    const seta = "seta-" + useId().replace(/:/g, "");

    if (estados.length === 0) {
        return <p className="diagrama-vazio">Informe o estado inicial ou uma transição para montar o diagrama.</p>;
    }

    const { centro, nos } = posicionar(estados);
    const porId = new Map(nos.map((no) => [no.id, no]));
    const minX = Math.min(...nos.map((no) => no.x - no.rx)) - 70;
    const minY = Math.min(...nos.map((no) => no.y - no.ry)) - (estados.length === 1 ? 130 : 90);
    const largura = Math.max(...nos.map((no) => no.x + no.rx)) + 90 - minX;
    const altura = Math.max(...nos.map((no) => no.y + no.ry)) + 80 - minY;

    const grupos = new Map();
    arestas.forEach(({ de, para, rotulo }) => {
        if (!porId.has(de) || !porId.has(para)) {
            return;
        }
        const chave = de + "\u0000" + para;
        if (!grupos.has(chave)) {
            grupos.set(chave, []);
        }
        if (!grupos.get(chave).includes(rotulo)) {
            grupos.get(chave).push(rotulo);
        }
    });

    const noInicial = porId.get(inicial);
    const chaveAtiva = arestaAtiva ? arestaAtiva.de + "\u0000" + arestaAtiva.para : null;

    return (
        <svg
            className="diagrama-svg"
            width={largura}
            height={altura}
            viewBox={`${minX} ${minY} ${largura} ${altura}`}
            role="img"
            aria-label={rotuloAria}
        >
            <defs>
                <marker id={seta} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="diag-preenche" />
                </marker>
                <marker id={seta + "-ativa"} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="diag-preenche-ativa" />
                </marker>
            </defs>

            {[...grupos.entries()]
                // A aresta da transição em andamento é desenhada por último, por cima das outras.
                .sort(([a], [b]) => (a === chaveAtiva) - (b === chaveAtiva))
                .map(([chave, rotulos]) => {
                    const [de, para] = chave.split("\u0000");
                    const ativa = chave === chaveAtiva;
                    // Setas para o estado de rejeição ficam mais claras: o caminho
                    // principal da máquina continua legível mesmo com várias delas.
                    const classes = [rejeicao.includes(para) && "diag-aresta-rejeicao", ativa && "diag-aresta-ativa"].filter(Boolean).join(" ");
                    return (
                        <g key={chave} className={classes || undefined}>
                            <Aresta origem={porId.get(de)} destino={porId.get(para)} rotulos={rotulos} centro={centro}
                                seta={ativa ? seta + "-ativa" : seta} lacoInicial={de === inicial} />
                        </g>
                    );
                })}

            {nos.map((no) => {
                const ativo = ativos.includes(no.id);
                return (
                    <g key={no.id} className={ativo ? "diag-no ativo" : "diag-no"}>
                        <ellipse
                            cx={no.x}
                            cy={no.y}
                            rx={no.rx}
                            ry={no.ry}
                            className="diag-circulo"
                            strokeWidth={ativo ? 2.6 : 1.7}
                            strokeDasharray={rejeicao.includes(no.id) ? "5 4" : undefined}
                        />
                        {finais.includes(no.id) && (
                            <ellipse
                                cx={no.x}
                                cy={no.y}
                                rx={Math.max(18, no.rx - 7)}
                                ry={Math.max(16, no.ry - 7)}
                                fill="none"
                                className="diag-traco"
                                strokeWidth={1.4}
                            />
                        )}
                        <text x={no.x} y={no.y + 6} textAnchor="middle" fontFamily={FONTE} fontSize={18} className="diag-nome">
                            {no.id}
                        </text>
                    </g>
                );
            })}

            {noInicial && (
                <line
                    x1={noInicial.x - noInicial.rx - 46}
                    y1={noInicial.y}
                    x2={noInicial.x - noInicial.rx - 2}
                    y2={noInicial.y}
                    className="diag-traco"
                    strokeWidth={1.6}
                    markerEnd={`url(#${seta})`}
                />
            )}
        </svg>
    );
}

/*
 * Monta a lista Q a partir do que está na tela: inicial, os dois lados de
 * cada transição e os estados finais, sem repetir. |Q| é o tamanho dela.
 */
const PADRAO_ESTADO = /^[A-Za-z][A-Za-z0-9_]*$/;

export function montarEstados(inicial, transicoes, ...outros) {
    const estados = [];
    const adicionar = (estado) => {
        const nome = (estado || "").trim();
        if (PADRAO_ESTADO.test(nome) && !estados.includes(nome)) {
            estados.push(nome);
        }
    };
    adicionar(inicial);
    transicoes.forEach((t) => {
        adicionar(t.de);
        adicionar(t.para);
    });
    outros.flat().forEach(adicionar);
    return estados;
}

export function ehEstado(nome) {
    return PADRAO_ESTADO.test((nome || "").trim());
}

export function listaEstados(texto) {
    return (texto || "").split(/[,;\s]+/).map((s) => s.trim()).filter(ehEstado);
}
