/*
 * Troca de página em carrossel, como ao passar as fotos de um post.
 *
 * As páginas ficam todas montadas (o que foi digitado numa aba não se perde)
 * e só a ativa aparece. Na troca, a página que sai e a que entra deslizam
 * juntas na horizontal; o sentido segue a ordem das abas (avançar empurra
 * para a esquerda, voltar para a direita). Dentro da página que entra, cada
 * seção chega com um pequeno atraso em relação à anterior (paralaxe), o que
 * dá profundidade ao movimento. Ao abrir o site, as seções sobem uma a uma.
 * As animações ficam em estilos/movimento.css.
 */
import { useLayoutEffect, useRef, useState } from "react";

export const DURACAO_MS = 480;

export default function Carrossel({ paginas, ativa }) {
    const [transicao, setTransicao] = useState({ anterior: null, direcao: "inicial" });
    const ultima = useRef(ativa);

    useLayoutEffect(() => {
        if (ultima.current === ativa) {
            return undefined;
        }
        const posicao = (id) => paginas.findIndex((p) => p.id === id);
        const direcao = posicao(ativa) > posicao(ultima.current) ? "avanca" : "volta";
        setTransicao({ anterior: ultima.current, direcao });
        ultima.current = ativa;
        const fim = setTimeout(() => setTransicao((t) => ({ ...t, anterior: null })), DURACAO_MS);
        return () => clearTimeout(fim);
    }, [ativa, paginas]);

    return (
        <div className="carrossel">
            {paginas.map(({ id, Componente }) => {
                const entrando = id === ativa;
                const saindo = id === transicao.anterior && !entrando;
                let classe = "pagina-carrossel";
                if (entrando) classe += " entrando-" + transicao.direcao;
                if (saindo) classe += " saindo-" + transicao.direcao;
                return (
                    <div
                        key={id}
                        className={classe}
                        hidden={!entrando && !saindo}
                        aria-hidden={saindo || undefined}
                        inert={saindo ? "" : undefined}
                    >
                        <Componente />
                    </div>
                );
            })}
        </div>
    );
}
