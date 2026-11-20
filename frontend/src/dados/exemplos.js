/*
 * Exemplos prontos de cada módulo. Os marcados "(PDF)" são os do enunciado
 * do projeto e servem de roteiro para a apresentação.
 */

export const EXEMPLOS_LINGUAGEM = [
    {
        nome: "Σ = {a,b}, abba (PDF)",
        descricao: "Exemplo do enunciado: cadeia válida, tamanho 4",
        dados: { alfabeto: "a,b", linguagem: "ab, ba, abba", cadeia: "abba", cadeia2: "ab", k: 3 }
    },
    {
        nome: "Binário, cadeia inválida",
        descricao: "Cadeia com símbolo fora de Σ",
        dados: { alfabeto: "0,1", linguagem: "0, 1, 01, 10", cadeia: "0121", cadeia2: "1", k: 3 }
    },
    {
        nome: "Cadeia vazia",
        descricao: "λ pertence a Σ* mas não a Σ+",
        dados: { alfabeto: "a,b,c", linguagem: "λ, a", cadeia: "λ", cadeia2: "abc", k: 2 }
    }
];

const t = (origem, simbolo, destino) => ({ origem, simbolo, destino });

export const EXEMPLOS_AF = [
    {
        nome: "q0 –a→ q1 –b→ q2 (PDF)",
        descricao: "AFD do enunciado; entrada ab é aceita",
        dados: {
            tipo: "AFD",
            alfabeto: "a,b",
            estadoInicial: "q0",
            estadosFinais: "q2",
            cadeia: "ab",
            transicoes: [t("q0", "a", "q1"), t("q1", "b", "q2")]
        }
    },
    {
        nome: "AFD: nº par de a",
        descricao: "Aceita cadeias sobre {a,b} com quantidade par de a",
        dados: {
            tipo: "AFD",
            alfabeto: "a,b",
            estadoInicial: "par",
            estadosFinais: "par",
            cadeia: "abbaba",
            transicoes: [t("par", "a", "impar"), t("par", "b", "par"), t("impar", "a", "par"), t("impar", "b", "impar")]
        }
    },
    {
        nome: "AFN: termina em ab",
        descricao: "Não determinismo: o autômato adivinha onde começa o sufixo ab",
        dados: {
            tipo: "AFN",
            alfabeto: "a,b",
            estadoInicial: "q0",
            estadosFinais: "q2",
            cadeia: "babab",
            transicoes: [t("q0", "a", "q0"), t("q0", "b", "q0"), t("q0", "a", "q1"), t("q1", "b", "q2")]
        }
    },
    {
        nome: "AFN-λ: a* ou b*",
        descricao: "Transições vazias escolhem entre dois ramos",
        dados: {
            tipo: "AFN",
            alfabeto: "a,b",
            estadoInicial: "q0",
            estadosFinais: "q1, q2",
            cadeia: "aaa",
            transicoes: [t("q0", "λ", "q1"), t("q0", "λ", "q2"), t("q1", "a", "q1"), t("q2", "b", "q2")]
        }
    }
];

export const EXEMPLOS_GLC = [
    {
        nome: "S → aSb | λ (PDF)",
        descricao: "Gramática do enunciado; aaabbb é aceita",
        dados: { variaveis: "S", terminais: "a,b", simboloInicial: "S", producoes: "S -> aSb | λ", cadeia: "aaabbb" }
    },
    {
        nome: "Parênteses balanceados",
        descricao: "S → (S) | SS | λ",
        dados: { variaveis: "S", terminais: "(,)", simboloInicial: "S", producoes: "S -> (S) | SS | λ", cadeia: "(()())" }
    },
    {
        nome: "Expressões aritméticas",
        descricao: "Gramática clássica E, T, F",
        dados: {
            variaveis: "E,T,F",
            terminais: "a,+,*,(,)",
            simboloInicial: "E",
            producoes: "E -> E+T | T\nT -> T*F | F\nF -> (E) | a",
            cadeia: "a+a*a"
        }
    },
    {
        nome: "Palíndromos",
        descricao: "S → aSa | bSb | a | b | λ",
        dados: { variaveis: "S", terminais: "a,b", simboloInicial: "S", producoes: "S -> aSa | bSb | a | b | λ", cadeia: "abbba" }
    }
];

const p = (origem, le, desempilha, destino, empilha) => ({ origem, le, desempilha, destino, empilha });

export const EXEMPLOS_AP = [
    {
        nome: "aⁿbⁿ, n ≥ 1 (PDF)",
        descricao: "Linguagem mínima do enunciado, aceitação por estado final",
        dados: {
            alfabeto: "a,b",
            alfabetoPilha: "A,Z",
            estadoInicial: "q0",
            simboloPilha: "Z",
            estadosFinais: "q2",
            criterio: "estado",
            cadeia: "aaabbb",
            transicoes: [
                p("q0", "a", "Z", "q0", "AZ"),
                p("q0", "a", "A", "q0", "AA"),
                p("q0", "b", "A", "q1", "λ"),
                p("q1", "b", "A", "q1", "λ"),
                p("q1", "λ", "Z", "q2", "Z")
            ]
        }
    },
    {
        nome: "aⁿbⁿ por pilha vazia",
        descricao: "Mesma linguagem, aceitando quando a pilha esvazia",
        dados: {
            alfabeto: "a,b",
            alfabetoPilha: "A,Z",
            estadoInicial: "q0",
            simboloPilha: "Z",
            estadosFinais: "",
            criterio: "pilha",
            cadeia: "aabb",
            transicoes: [
                p("q0", "a", "Z", "q0", "AZ"),
                p("q0", "a", "A", "q0", "AA"),
                p("q0", "b", "A", "q1", "λ"),
                p("q1", "b", "A", "q1", "λ"),
                p("q1", "λ", "Z", "q1", "λ")
            ]
        }
    },
    {
        nome: "wwᴿ (não determinístico)",
        descricao: "Palíndromos de tamanho par: o AP adivinha o meio da cadeia",
        dados: {
            alfabeto: "a,b",
            alfabetoPilha: "a,b,Z",
            estadoInicial: "q0",
            simboloPilha: "Z",
            estadosFinais: "q2",
            criterio: "estado",
            cadeia: "abba",
            transicoes: [
                p("q0", "a", "λ", "q0", "a"),
                p("q0", "b", "λ", "q0", "b"),
                p("q0", "λ", "λ", "q1", "λ"),
                p("q1", "a", "a", "q1", "λ"),
                p("q1", "b", "b", "q1", "λ"),
                p("q1", "λ", "Z", "q2", "Z")
            ]
        }
    }
];

const m = (estadoInicial, simboloLido, novoEstado, simboloEscrito, movimento) =>
    ({ estadoInicial, simboloLido, novoEstado, simboloEscrito, movimento });

/*
 * Exemplos da MT escritos para os dois modos de estados finais. ACEITA e
 * REJEITA são trocados pelos nomes do modo escolhido (montarExemploMT):
 *   - "somente qfinal": ACEITA vira qfinal e as rejeições não entram (uma
 *     transição que falta já faz a máquina parar e rejeitar);
 *   - "qaceita e qrejeita": entram também as transições para qrejeita, que
 *     deixam explícito no diagrama onde a máquina rejeita.
 */
export const ACEITA = "ACEITA";
export const REJEITA = "REJEITA";

export const EXEMPLOS_MT = [
    {
        nome: "Opção B: soma unária (PDF)",
        descricao: "000100 representa 3 + 2; a fita termina com 00000",
        dados: {
            alfabeto: "0,1",
            estadoInicial: "q0",
            cadeia: "000100",
            transicoes: [
                m("q0", "0", "q0", "0", "D"),
                m("q0", "1", "q1", "0", "D"),
                m("q1", "0", "q1", "0", "D"),
                m("q1", "B", "q2", "B", "E"),
                m("q2", "0", "q3", "B", "E"),
                m("q3", "0", "q3", "0", "E"),
                m("q3", "B", ACEITA, "B", "D")
            ],
            rejeicoes: [
                m("q0", "B", REJEITA, "B", "D"), // não há separador 1
                m("q1", "1", REJEITA, "1", "D")  // mais de um separador
            ]
        }
    },
    {
        nome: "Opção A: w#w (PDF)",
        descricao: "Marca com x cada símbolo de w e confere com o lado direito do #",
        dados: {
            alfabeto: "0,1,#",
            estadoInicial: "q0",
            cadeia: "01#01",
            transicoes: [
                m("q0", "0", "q1", "x", "D"),
                m("q0", "1", "q2", "x", "D"),
                m("q0", "#", "q7", "#", "D"),
                m("q1", "0", "q1", "0", "D"),
                m("q1", "1", "q1", "1", "D"),
                m("q1", "#", "q3", "#", "D"),
                m("q2", "0", "q2", "0", "D"),
                m("q2", "1", "q2", "1", "D"),
                m("q2", "#", "q4", "#", "D"),
                m("q3", "x", "q3", "x", "D"),
                m("q3", "0", "q5", "x", "E"),
                m("q4", "x", "q4", "x", "D"),
                m("q4", "1", "q5", "x", "E"),
                m("q5", "x", "q5", "x", "E"),
                m("q5", "#", "q6", "#", "E"),
                m("q6", "0", "q6", "0", "E"),
                m("q6", "1", "q6", "1", "E"),
                m("q6", "x", "q0", "x", "D"),
                m("q7", "x", "q7", "x", "D"),
                m("q7", "B", ACEITA, "B", "D")
            ],
            rejeicoes: [
                m("q0", "B", REJEITA, "B", "D"), // cadeia sem #
                m("q1", "B", REJEITA, "B", "D"), // w sem #
                m("q2", "B", REJEITA, "B", "D"),
                m("q3", "1", REJEITA, "1", "D"), // o par não confere
                m("q3", "B", REJEITA, "B", "D"), // lado direito mais curto
                m("q4", "0", REJEITA, "0", "D"),
                m("q4", "B", REJEITA, "B", "D"),
                m("q7", "0", REJEITA, "0", "D"), // lado direito mais longo
                m("q7", "1", REJEITA, "1", "D")
            ]
        }
    },
    {
        nome: "Apaga o último 0",
        descricao: "A máquina original do professor",
        dados: {
            alfabeto: "0,1",
            estadoInicial: "q0",
            cadeia: "000100",
            transicoes: [
                m("q0", "0", "q0", "0", "D"),
                m("q0", "1", "q1", "1", "D"),
                m("q1", "0", "q1", "0", "D"),
                m("q1", "B", "q2", "B", "E"),
                m("q2", "0", "q3", "B", "D"),
                m("q3", "B", ACEITA, "B", "D")
            ],
            rejeicoes: [
                m("q0", "B", REJEITA, "B", "D"), // não há 1
                m("q2", "1", REJEITA, "1", "D")  // nenhum 0 depois do 1
            ]
        }
    }
];

/* Nomes padrão dos estados finais em cada modo. */
export function nomesFinais(modo) {
    return modo === "par" ? { aceita: "qaceita", rejeita: "qrejeita" } : { aceita: "qfinal", rejeita: "" };
}

/* Monta as transições de um exemplo para o modo escolhido. */
export function montarExemploMT(exemplo, modo) {
    const { aceita, rejeita } = nomesFinais(modo);
    const trocar = (estado) => (estado === ACEITA ? aceita : estado === REJEITA ? rejeita : estado);
    const lista = modo === "par" ? [...exemplo.dados.transicoes, ...exemplo.dados.rejeicoes] : exemplo.dados.transicoes;
    return {
        alfabeto: exemplo.dados.alfabeto,
        estadoInicial: exemplo.dados.estadoInicial,
        cadeia: exemplo.dados.cadeia,
        modo,
        aceita,
        rejeita,
        transicoes: lista.map((t) => ({ ...t, estadoInicial: trocar(t.estadoInicial), novoEstado: trocar(t.novoEstado) }))
    };
}
