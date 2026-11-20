/*
 * Convenções de escrita usadas em toda a interface, iguais às da API:
 * λ é a cadeia vazia, ⊔ é o branco da fita e alfabetos aceitam "a,b",
 * "a, b" ou "ab".
 */

export const LAMBDA = "λ";
export const BRANCO = "⊔";

/* Conjunto escrito como {a, b}. */
export function conjunto(lista) {
    return "{" + lista.join(", ") + "}";
}

/* Alfabeto como na API: "a,b", "a, b" ou "ab". Devolve a lista de símbolos sem repetição. */
export function lerAlfabeto(texto) {
    const bruto = (texto || "").replace(/[{}\s]/g, "").replace(/[，；;]/g, ",");
    if (!bruto) return [];
    const tokens = bruto.includes(",") ? bruto.split(",").filter(Boolean) : [...bruto];
    return [...new Set(tokens)];
}

/* λ, ε, "lambda" e o campo vazio representam a cadeia vazia. */
export function ehLambda(s) {
    const t = (s || "").trim();
    return t === "" || t === "λ" || t === "ε" || t.toLowerCase() === "lambda";
}
