/*
 * Chamada única aos endpoints do Spring. Todos devolvem JSON com `tipo`
 * ("aceita", "rejeita" ou "erro") e `motivo`. Erro de configuração vem
 * com status 400, mas o corpo tem o mesmo formato, então é tratado igual.
 */
export async function enviar(url, corpo) {
    try {
        const resposta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo)
        });
        try {
            return await resposta.json();
        } catch {
            return { tipo: "erro", motivo: "O servidor não devolveu um resultado legível." };
        }
    } catch {
        return {
            tipo: "erro",
            motivo: "Não foi possível falar com o servidor. Confira se a aplicação Spring está no ar (porta 8080)."
        };
    }
}
