/*
 * Janela da fita: o cabeçote fica parado no centro e a fita desliza por
 * baixo dele, como num toca-fitas. O deslize é uma transição CSS de
 * transform (interrompível): no avanço rápido, um passo novo retoma o
 * movimento de onde o anterior estava, sem saltos. A célula que acabou de
 * ser escrita pisca uma vez.
 */
import { BRANCO } from "../../utilitarios/simbolos.js";
import { simboloNaPosicao } from "../../utilitarios/fitaTuring.js";

const MARGEM = 12; // células de branco visíveis antes e depois da parte usada

const visual = (s) => (s === "B" ? BRANCO : s);

export default function FitaCassete({ quadros, largura, indice, duracaoMs }) {
    const quadro = quadros[indice];

    // Célula que a última regra escreveu: a que difere do quadro anterior.
    const escritas = new Set();
    if (indice > 0) {
        for (let g = 0; g < largura; g++) {
            if (simboloNaPosicao(quadros[indice - 1], g) !== simboloNaPosicao(quadro, g)) escritas.add(g);
        }
    }

    const posicoes = [];
    for (let g = -MARGEM; g < largura + MARGEM; g++) posicoes.push(g);

    return (
        <div className="fita-janela" style={{ "--duracao-fita": `${duracaoMs}ms` }}>
            <div
                className="fita-trilho"
                style={{ transform: `translateX(calc(-1 * (${quadro.cabecoteGlobal + MARGEM} + 0.5) * var(--passo-celula)))` }}
                role="list"
                aria-label="Fita"
            >
                {posicoes.map((g) => {
                    const simbolo = simboloNaPosicao(quadro, g);
                    const classes = ["fita-celula"];
                    if (simbolo === "B") classes.push("branco");
                    if (g === quadro.cabecoteGlobal) classes.push("sob-cabecote");
                    if (escritas.has(g)) classes.push("escrita");
                    return (
                        <span key={escritas.has(g) ? `${g}-${indice}` : g} className={classes.join(" ")} role="listitem">
                            {visual(simbolo)}
                        </span>
                    );
                })}
            </div>
            <div className="fita-cabecote" aria-hidden="true">
                <span className="fita-estado">{quadro.estado}</span>
            </div>
        </div>
    );
}
