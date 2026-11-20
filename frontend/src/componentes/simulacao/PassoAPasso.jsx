/*
 * Navegação entre os passos de uma simulação. "Reproduzir" avança sozinho,
 * útil na apresentação. O pai guarda o índice para destacar o diagrama.
 */
import { useEffect, useState } from "react";

export default function PassoAPasso({ total, indice, aoMudar, rotulo }) {
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
