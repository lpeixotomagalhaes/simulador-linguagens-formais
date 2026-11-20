/*
 * Som curto ao trocar de aba. Não toca ao abrir a página, só nas trocas, e
 * respeita a preferência de som compartilhada (botão de alto-falante).
 */
import { useEffect, useRef } from "react";
import { somLigado } from "../utilitarios/preferenciaSom.js";

const ARQUIVO = import.meta.env.BASE_URL + "sons/troca-aba.mp3";

export default function useSomDeTroca(aba) {
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
        if (somLigado() && audio.current) {
            audio.current.currentTime = 0;
            audio.current.play().catch(() => {});
        }
    }, [aba]);
}
