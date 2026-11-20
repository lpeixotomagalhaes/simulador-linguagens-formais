/*
 * Módulo 3: Gramática livre de contexto. Define V, T, P e S, procura uma
 * derivação mais à esquerda da cadeia e mostra a árvore de derivação.
 */
import { useState } from "react";
import { enviar } from "../api/cliente.js";
import CaixaResultado from "../componentes/simulacao/CaixaResultado.jsx";
import Campo from "../componentes/formulario/Campo.jsx";
import DescricaoFormal from "../componentes/diagramas/DescricaoFormal.jsx";
import Exemplos from "../componentes/formulario/Exemplos.jsx";
import Numero from "../componentes/simulacao/Numero.jsx";
import PassoAPasso from "../componentes/simulacao/PassoAPasso.jsx";
import Quadro from "../componentes/layout/Quadro.jsx";
import { conjunto, lerAlfabeto } from "../utilitarios/simbolos.js";
import ArvoreDerivacao from "../componentes/diagramas/ArvoreDerivacao.jsx";
import { EXEMPLOS_GLC } from "../dados/exemplos.js";

export default function Gramatica() {
    const [form, setForm] = useState(EXEMPLOS_GLC[0].dados);
    const [resultado, setResultado] = useState(null);
    const [passo, setPasso] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const mudar = (chave) => (valor) => {
        setForm({ ...form, [chave]: valor });
        setResultado(null);
    };

    const derivar = async (evento) => {
        evento?.preventDefault();
        setCarregando(true);
        const dados = await enviar("/api/gramatica/derivar", form);
        setResultado(dados);
        setPasso(dados.derivacao?.length ? dados.derivacao.length - 1 : 0);
        setCarregando(false);
    };

    const variaveis = lerAlfabeto(form.variaveis);
    const terminais = lerAlfabeto(form.terminais);
    const regras = form.producoes.split("\n").map((l) => l.trim()).filter(Boolean);
    const derivacao = resultado?.derivacao || [];

    return (
        <form onSubmit={derivar}>
            <Quadro
                titulo="Definição da gramática"
                descricao="G = (V, T, P, S). Cada variável e cada terminal é um caractere. Escreva uma regra por linha, com alternativas separadas por |."
                acoes={<Exemplos exemplos={EXEMPLOS_GLC} aoEscolher={(ex) => { setForm(ex.dados); setResultado(null); }} />}
            >
                <div className="metadados tres">
                    <Campo rotulo="Variáveis (V)" valor={form.variaveis} aoMudar={mudar("variaveis")} placeholder="S,A" />
                    <Campo rotulo="Terminais (T)" valor={form.terminais} aoMudar={mudar("terminais")} placeholder="a,b" />
                    <Campo rotulo="Símbolo inicial (S)" valor={form.simboloInicial} aoMudar={mudar("simboloInicial")} placeholder="S" maxLength={1} />
                </div>
                <label>
                    Produções (P)
                    <textarea
                        className="mono"
                        rows={5}
                        value={form.producoes}
                        onChange={(e) => mudar("producoes")(e.target.value)}
                        placeholder={"S -> aSb | λ"}
                        spellCheck={false}
                    />
                    <span className="dica-campo">Use -&gt; ou →. λ (ou ε) é a produção vazia.</span>
                </label>
                <div className="entrada">
                    <Campo rotulo="Cadeia de entrada" valor={form.cadeia} aoMudar={mudar("cadeia")} placeholder="aaabbb" mono />
                    <button type="submit" className="botao-reconhecer" disabled={carregando}>
                        {carregando ? "Derivando..." : "Derivar cadeia"}
                    </button>
                </div>
                <DescricaoFormal
                    tupla={`G = (V, T, P, ${form.simboloInicial || "S"})`}
                    itens={[
                        [`V = ${conjunto(variaveis)}`, "variáveis (não terminais)"],
                        [`T = ${conjunto(terminais)}`, "terminais"],
                        [`|P| = ${regras.reduce((n, r) => n + (r.split(/->|→/)[1]?.split("|").length || 0), 0)}`, "quantidade de produções"]
                    ]}
                />
            </Quadro>

            <CaixaResultado dados={resultado}>
                <h3>Derivação mais à esquerda</h3>
                <PassoAPasso total={derivacao.length} indice={passo} aoMudar={setPasso} />
                <ol className="derivacao">
                    {derivacao.map((d) => (
                        <li
                            key={d.numero}
                            className={(d.numero === passo ? "selecionado " : "") + (d.numero > passo ? "futuro" : "")}
                            onClick={() => setPasso(d.numero)}
                        >
                            <span className="seta-derivacao">{d.numero === 0 ? "" : "⇒"}</span>
                            <span className="mono forma">{d.forma}</span>
                            {d.producao && <span className="producao">usando {d.producao}</span>}
                        </li>
                    ))}
                </ol>
                <p className="dica">
                    Em linha: {derivacao.map((d) => d.forma).join(" ⇒ ")}
                </p>
                <h3>Árvore de derivação</h3>
                <p className="dica">As folhas, lidas da esquerda para a direita, formam a cadeia. Círculos de borda grossa são variáveis.</p>
                <ArvoreDerivacao arvore={resultado?.arvore} />
                <p className="dica">Formas sentenciais exploradas pela busca: <Numero valor={resultado?.nosExplorados} /></p>
            </CaixaResultado>
        </form>
    );
}
