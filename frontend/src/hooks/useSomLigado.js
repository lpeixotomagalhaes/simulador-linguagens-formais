/* Lê e altera a preferência de som compartilhada (utilitarios/preferenciaSom.js). */
import { useCallback, useSyncExternalStore } from "react";
import { definirSom, inscrever, somLigado } from "../utilitarios/preferenciaSom.js";

export default function useSomLigado() {
    const ligado = useSyncExternalStore(inscrever, somLigado);
    const alternar = useCallback(() => definirSom(!somLigado()), []);
    return [ligado, alternar];
}
