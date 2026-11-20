/*
 * Posição do indicador que desliza sob a aba ativa. Mede a aba depois de
 * cada troca, ao redimensionar a janela e quando as fontes terminam de
 * carregar (a largura do texto muda).
 */
import { useLayoutEffect, useRef, useState } from "react";

export default function useIndicadorDeAba(aba) {
    const nav = useRef(null);
    const [posicao, setPosicao] = useState(null);

    useLayoutEffect(() => {
        const medir = () => {
            const ativa = nav.current?.querySelector(".aba.ativa");
            if (ativa) {
                setPosicao({ x: ativa.offsetLeft, largura: ativa.offsetWidth });
                ativa.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
        };
        medir();
        window.addEventListener("resize", medir);
        document.fonts?.ready.then(medir);
        return () => window.removeEventListener("resize", medir);
    }, [aba]);

    return [nav, posicao];
}
