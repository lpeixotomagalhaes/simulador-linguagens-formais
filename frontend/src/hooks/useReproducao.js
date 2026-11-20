/*
 * Controles de reprodução no estilo toca-fitas para uma sequência de passos.
 *
 * modo: "parado", "tocando" (um passo por vez, na velocidade escolhida),
 * "avancando" (avanço rápido) ou "rebobinando" (volta rápido). Cada modo
 * para sozinho ao chegar na ponta da fita. O índice fica com o componente
 * pai (para a tabela de passos e o diagrama usarem o mesmo valor).
 */
import { useCallback, useEffect, useState } from "react";

export const VELOCIDADES = [0.5, 1, 2];
const PASSO_TOCANDO_MS = 900;
const PASSO_RAPIDO_MS = 150;

export default function useReproducao(total, indice, aoMudar) {
    const [modo, setModo] = useState("parado");
    const [velocidade, setVelocidade] = useState(1);
    const ultimo = Math.max(0, total - 1);
    const intervalo = modo === "tocando" ? PASSO_TOCANDO_MS / velocidade : PASSO_RAPIDO_MS;

    // Uma nova simulação (outra quantidade de passos) para a fita.
    useEffect(() => {
        setModo("parado");
    }, [total]);

    useEffect(() => {
        if (modo === "parado") return undefined;
        const voltando = modo === "rebobinando";
        if (voltando ? indice <= 0 : indice >= ultimo) {
            setModo("parado");
            return undefined;
        }
        const t = setTimeout(() => aoMudar(indice + (voltando ? -1 : 1)), intervalo);
        return () => clearTimeout(t);
    }, [modo, indice, ultimo, intervalo, aoMudar]);

    const ir = useCallback((i) => {
        setModo("parado");
        aoMudar(Math.max(0, Math.min(ultimo, i)));
    }, [ultimo, aoMudar]);

    const alternarPlay = useCallback(() => {
        if (modo === "tocando") {
            setModo("parado");
            return;
        }
        if (indice >= ultimo) aoMudar(0); // no fim, o play recomeça do início
        setModo("tocando");
    }, [modo, indice, ultimo, aoMudar]);

    const alternar = (alvo, possivel) => () => setModo((m) => (m === alvo ? "parado" : possivel ? alvo : m));

    return {
        modo,
        velocidade,
        setVelocidade,
        intervalo,
        alternarPlay,
        rebobinar: alternar("rebobinando", indice > 0),
        avancar: alternar("avancando", indice < ultimo),
        passoTras: () => ir(indice - 1),
        passoFrente: () => ir(indice + 1),
        inicio: () => ir(0),
        fim: () => ir(ultimo)
    };
}
