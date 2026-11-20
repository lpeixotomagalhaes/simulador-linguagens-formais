/*
 * Quadros da fita da máquina de Turing, para a animação passo a passo.
 *
 * A API devolve, para cada passo, a fita como estava antes da regra e a
 * posição do cabeçote nela. Quando o cabeçote anda para a esquerda da
 * primeira célula, a Fita do backend insere um branco na posição 0 e todos
 * os índices seguintes aumentam em 1. Para a fita deslizar sem saltos, cada
 * célula recebe uma posição global que não muda entre os quadros:
 *
 *     global = índice no quadro - inserções à esquerda até ali + total de inserções
 */

const BRANCO = "B";

export function montarQuadrosDaFita(resultado) {
    const passos = resultado?.passos || [];
    const quadros = passos.map((p) => ({
        fita: p.fita,
        cabecote: p.cabecote,
        estado: p.estado,
        passo: p
    }));
    quadros.push({
        fita: resultado?.fitaFinal || "",
        cabecote: resultado?.cabecoteFinal ?? 0,
        estado: resultado?.estado,
        passo: null
    });

    // Inserções à esquerda acumuladas antes de cada quadro.
    const insercoes = [0];
    passos.forEach((p, i) => {
        const inseriu = p.movimento === "E" && p.cabecote === 0;
        insercoes.push(insercoes[i] + (inseriu ? 1 : 0));
    });
    const total = insercoes[insercoes.length - 1];

    const posicionados = quadros.map((q, i) => {
        const deslocamento = total - insercoes[i];
        return { ...q, deslocamento, cabecoteGlobal: q.cabecote + deslocamento };
    });
    const largura = Math.max(1, ...posicionados.map((q) => q.fita.length + q.deslocamento));

    return { quadros: posicionados, largura };
}

/* Símbolo de um quadro numa posição global (fora da parte criada, é branco). */
export function simboloNaPosicao(quadro, global) {
    const local = global - quadro.deslocamento;
    return local >= 0 && local < quadro.fita.length ? quadro.fita[local] : BRANCO;
}
