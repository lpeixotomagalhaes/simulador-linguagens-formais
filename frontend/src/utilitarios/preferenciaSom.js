/*
 * Preferência de som (ligado ou desligado), compartilhada pela troca de aba e
 * pelo toca-fitas. Fica guardada no navegador; sem armazenamento disponível,
 * vale só durante a visita. Quem quiser reagir à mudança se inscreve.
 */

const CHAVE = "som-abas";
const inscritos = new Set();

let ligado = (() => {
    try {
        return localStorage.getItem(CHAVE) !== "desligado";
    } catch {
        return true;
    }
})();

export function somLigado() {
    return ligado;
}

export function definirSom(valor) {
    ligado = valor;
    try {
        localStorage.setItem(CHAVE, valor ? "ligado" : "desligado");
    } catch {
        /* sem armazenamento: a escolha vale só nesta visita */
    }
    inscritos.forEach((avisar) => avisar());
}

export function inscrever(avisar) {
    inscritos.add(avisar);
    return () => inscritos.delete(avisar);
}
