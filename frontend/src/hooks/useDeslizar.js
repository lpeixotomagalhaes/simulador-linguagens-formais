/*
 * Gesto de deslizar na horizontal (toque), como num carrossel: para a
 * esquerda avança, para a direita volta. Só conta um movimento claramente
 * horizontal e longo; não dispara quando o gesto começa num campo, numa
 * tabela, num diagrama ou em outra área que rola sozinha.
 */
import { useEffect } from "react";

const DISTANCIA_MINIMA = 70;
const IGNORAR = "input, textarea, select, button, .diagrama, .tabela-wrap, .fita, .cadeias, .abas";

export default function useDeslizar(alvo, { aoAvancar, aoVoltar }) {
    useEffect(() => {
        const elemento = alvo.current;
        if (!elemento) return undefined;
        let inicio = null;

        const aoTocar = (e) => {
            if (e.pointerType !== "touch" || e.target.closest(IGNORAR)) {
                inicio = null;
                return;
            }
            inicio = { x: e.clientX, y: e.clientY };
        };
        const aoSoltar = (e) => {
            if (!inicio) return;
            const dx = e.clientX - inicio.x;
            const dy = e.clientY - inicio.y;
            inicio = null;
            if (Math.abs(dx) < DISTANCIA_MINIMA || Math.abs(dx) < 2 * Math.abs(dy)) return;
            if (dx < 0) aoAvancar();
            else aoVoltar();
        };

        elemento.addEventListener("pointerdown", aoTocar);
        elemento.addEventListener("pointerup", aoSoltar);
        return () => {
            elemento.removeEventListener("pointerdown", aoTocar);
            elemento.removeEventListener("pointerup", aoSoltar);
        };
    }, [alvo, aoAvancar, aoVoltar]);
}
