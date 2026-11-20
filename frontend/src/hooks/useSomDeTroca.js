/*
 * Som curto ao trocar de aba. Não toca ao abrir a página, só nas trocas.
 * A preferência (ligado ou desligado) fica guardada no navegador; sem
 * armazenamento disponível, vale só durante a visita.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const CHAVE = "som-abas";
const ARQUIVO = import.meta.env.BASE_URL + "sons/troca-aba.mp3";

function lerPreferencia() {
    try {
        return localStorage.getItem(CHAVE) !== "desligado";
    } catch {
        return true;
    }
}

export default function useSomDeTroca(aba) {
    const [ligado, setLigado] = useState(lerPreferencia);
    const audio = useRef(null);
    const anterior = useRef(aba);

    useEffect(() => {
        audio.current = new Audio(ARQUIVO);
        audio.current.volume = 0.35;
        audio.current.preload = "auto";
    }, []);

    useEffect(() => {
        if (anterior.current === aba) {
            return;
        }
        anterior.current = aba;
        if (ligado && audio.current) {
            audio.current.currentTime = 0;
            audio.current.play().catch(() => {});
        }
    }, [aba, ligado]);

    const alternar = useCallback(() => {
        setLigado((atual) => {
            const novo = !atual;
            try {
                localStorage.setItem(CHAVE, novo ? "ligado" : "desligado");
            } catch {
                /* sem armazenamento: a escolha vale só nesta visita */
            }
            return novo;
        });
    }, []);

    return [ligado, alternar];
}
