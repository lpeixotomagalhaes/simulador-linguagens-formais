package com.br.unifor.simulador.dominio.linguagem;

import java.util.List;

/**
 * Resposta do módulo de linguagens formais.
 *
 * tipo é "aceita" (w pertence a Σ*), "rejeita" (w tem símbolo fora de Σ) ou
 * "erro" (configuração inválida). pertenceL é null quando L não foi informada.
 * sigmaEstrela e sigmaMais são as cadeias de Σ* e Σ+ até o comprimento k;
 * truncado avisa que a lista foi cortada no limite de itens.
 */
public record LinguagemResultado(
        String tipo,
        String motivo,
        List<String> alfabeto,
        String cadeia,
        int tamanho,
        boolean cadeiaValida,
        List<String> linguagem,
        Boolean pertenceL,
        String cadeia2,
        boolean cadeia2Valida,
        String concatenacao,
        int tamanhoConcatenacao,
        int k,
        List<String> sigmaEstrela,
        List<String> sigmaMais,
        boolean truncado
) {
    public static LinguagemResultado erro(String motivo) {
        return new LinguagemResultado("erro", motivo, List.of(), "", 0, false, List.of(), null,
                "", false, "", 0, 0, List.of(), List.of(), false);
    }
}
