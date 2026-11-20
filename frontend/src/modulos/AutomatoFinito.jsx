/*
 * Módulo 2: Autômato finito (AFD e AFN, com λ no AFN).
 * Monta o autômato numa tabela ou carrega por JSON, desenha o diagrama e
 * mostra a execução passo a passo, destacando os estados ativos.
 */
import { useMemo, useRef, useState } from "react";
import { enviar } from "../api.js";
import {
    CaixaResultado, Campo, DescricaoFormal, Exemplos, Fita, LAMBDA, PassoAPasso, Sanfona, Quadro, conjunto, ehLambda, lerAlfabeto
} from "../components/Comuns.jsx";
import DiagramaEstados, { listaEstados, montarEstados } from "../components/DiagramaEstados.jsx";
import TabelaTransicoes, { comIds } from "../components/TabelaTransicoes.jsx";
import { EXEMPLOS_AF } from "../exemplos.js";

const COLUNAS = [
    { chave: "origem", titulo: "Estado de origem", placeholder: "q0" },
    { chave: "simbolo", titulo: "Símbolo lido", placeholder: "a ou λ" },
    { chave: "destino", titulo: "Estado de destino", placeholder: "q1" }
];

function carregar(dados) {
    return { ...dados, transicoes: comIds(dados.transicoes || []) };
}

function paraJson(form) {
    const { transicoes, ...resto } = form;
    return { ...resto, transicoes: transicoes.map(({ origem, simbolo, destino }) => ({ origem, simbolo, destino })) };
}

export default function AutomatoFinito() {
    const [form, setForm] = useState(() => carregar(EXEMPLOS_AF[0].dados));
    const [resultado, setResultado] = useState(null);
    const [passo, setPasso] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const [json, setJson] = useState("");
    const [erroJson, setErroJson] = useState("");
    const arquivo = useRef(null);

    const mudar = (chave) => (valor) => {
        setForm({ ...form, [chave]: valor });
        setResultado(null);
    };

    const sigma = lerAlfabeto(form.alfabeto);
    const finais = listaEstados(form.estadosFinais);
    const arestas = form.transicoes
        .filter((t) => t.origem.trim() && t.destino.trim())
        .map((t) => ({ de: t.origem.trim(), para: t.destino.trim(), rotulo: ehLambda(t.simbolo) ? LAMBDA : t.simbolo.trim() }));
    const estados = montarEstados(form.estadoInicial, arestas, finais);

    // Avisos ao vivo: símbolo fora de Σ, λ ou repetição no AFD.
    const erros = useMemo(() => {
        const mapa = {};
        const vistos = new Map();
        form.transicoes.forEach((t) => {
            const s = t.simbolo.trim();
            let erro = null;
            if (ehLambda(s)) {
                if (form.tipo === "AFD" && s !== "") erro = "λ só é permitido no AFN.";
            } else if (s.length !== 1 || (sigma.length && !sigma.includes(s))) {
                erro = `“${s}” não está em Σ.`;
            } else if (form.tipo === "AFD") {
                const chave = t.origem.trim() + "\u0000" + s;
                if (vistos.has(chave)) erro = `${t.origem.trim()} já tem transição com ${s} (AFD).`;
                vistos.set(chave, true);
            }
            if (erro) mapa[t.id] = { simbolo: erro };
        });
        return mapa;
    }, [form.transicoes, form.tipo, sigma.join()]);

    const simular = async (evento) => {
        evento?.preventDefault();
        setCarregando(true);
        const dados = await enviar("/api/automato/simular", paraJson(form));
        setResultado(dados);
        setPasso(dados.passos?.length ? dados.passos.length - 1 : 0);
        setCarregando(false);
    };

    const importar = (texto) => {
        try {
            const dados = JSON.parse(texto);
            if (!Array.isArray(dados.transicoes)) throw new Error("O JSON precisa ter a lista \"transicoes\".");
            setForm(carregar({
                tipo: dados.tipo === "AFN" ? "AFN" : "AFD",
                alfabeto: Array.isArray(dados.alfabeto) ? dados.alfabeto.join(",") : dados.alfabeto || "",
                estadoInicial: dados.estadoInicial || "",
                estadosFinais: Array.isArray(dados.estadosFinais) ? dados.estadosFinais.join(",") : dados.estadosFinais || "",
                cadeia: dados.cadeia || "",
                transicoes: dados.transicoes.map((t) => ({
                    origem: t.origem ?? "", simbolo: t.simbolo ?? "", destino: t.destino ?? ""
                }))
            }));
            setErroJson("");
            setResultado(null);
        } catch (e) {
            setErroJson("JSON inválido: " + e.message);
        }
    };

    const baixar = () => {
        const blob = new Blob([JSON.stringify(paraJson(form), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "automato.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const passos = resultado?.passos || [];
    const atual = passos[passo];
    const cadeia = ehLambda(form.cadeia) ? [] : [...form.cadeia.trim()];

    return (
        <form onSubmit={simular}>
            <Quadro
                titulo="Definição do autômato"
                descricao="M = (Q, Σ, δ, q0, F). No AFD cada par (estado, símbolo) tem no máximo um destino; no AFN pode ter vários, e λ é a transição vazia."
                acoes={<Exemplos exemplos={EXEMPLOS_AF} aoEscolher={(ex) => { setForm(carregar(ex.dados)); setResultado(null); }} />}
            >
                <fieldset className="alternador">
                    <legend>Tipo</legend>
                    {["AFD", "AFN"].map((tipo) => (
                        <label key={tipo} className={form.tipo === tipo ? "ativo" : ""}>
                            <input type="radio" name="tipo-af" value={tipo} checked={form.tipo === tipo} onChange={() => mudar("tipo")(tipo)} />
                            {tipo === "AFD" ? "AFD (determinístico)" : "AFN (não determinístico)"}
                        </label>
                    ))}
                </fieldset>
                <div className="metadados tres">
                    <Campo rotulo="Alfabeto (Σ)" valor={form.alfabeto} aoMudar={mudar("alfabeto")} placeholder="a,b" />
                    <Campo rotulo="Estado inicial (q0)" valor={form.estadoInicial} aoMudar={mudar("estadoInicial")} placeholder="q0" />
                    <Campo rotulo="Estados finais (F)" valor={form.estadosFinais} aoMudar={mudar("estadosFinais")} placeholder="q2" dica="Separe por vírgula." />
                </div>

                <TabelaTransicoes
                    colunas={COLUNAS}
                    linhas={form.transicoes}
                    aoMudar={(transicoes) => { setForm({ ...form, transicoes }); setResultado(null); }}
                    erros={erros}
                    dica={form.tipo === "AFN"
                        ? "No AFN, repita a origem e o símbolo em linhas diferentes para ter vários destinos. Deixe o símbolo como λ para uma transição vazia."
                        : "Falta de transição significa que o AFD para e rejeita (estado de erro implícito)."}
                />

                <Sanfona titulo="Carregar ou salvar por JSON">
                    <p className="dica">Cole um JSON no formato abaixo, escolha um arquivo .json, ou baixe o autômato atual.</p>
                    <textarea
                        className="mono"
                        rows={10}
                        value={json}
                        placeholder={JSON.stringify(paraJson(carregar(EXEMPLOS_AF[0].dados)), null, 2)}
                        onChange={(e) => setJson(e.target.value)}
                        spellCheck={false}
                    />
                    {erroJson && <p className="erro-campo">{erroJson}</p>}
                    <div className="acoes-linha">
                        <button type="button" className="botao-secundario" onClick={() => importar(json)}>Importar JSON colado</button>
                        <button type="button" className="botao-secundario" onClick={() => arquivo.current?.click()}>Abrir arquivo .json</button>
                        <button type="button" className="botao-secundario" onClick={() => setJson(JSON.stringify(paraJson(form), null, 2))}>Mostrar JSON atual</button>
                        <button type="button" className="botao-secundario" onClick={baixar}>Baixar automato.json</button>
                        <input
                            ref={arquivo}
                            type="file"
                            accept="application/json,.json"
                            hidden
                            onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    const texto = await f.text();
                                    setJson(texto);
                                    importar(texto);
                                }
                                e.target.value = "";
                            }}
                        />
                    </div>
                </Sanfona>

                <div className="entrada">
                    <Campo rotulo="Cadeia de entrada" valor={form.cadeia} aoMudar={mudar("cadeia")} placeholder="ab (λ para vazia)" mono />
                    <button type="submit" className="botao-reconhecer" disabled={carregando}>
                        {carregando ? "Executando..." : "Executar cadeia"}
                    </button>
                </div>
            </Quadro>

            <Quadro titulo="Diagrama de estados" descricao="Atualiza enquanto você edita. Na simulação, os estados ativos do passo ficam destacados.">
                <div className="diagrama">
                    <DiagramaEstados
                        estados={estados}
                        inicial={form.estadoInicial.trim()}
                        finais={finais}
                        arestas={arestas}
                        ativos={atual ? atual.depois : []}
                        rotuloAria={"Diagrama do " + form.tipo}
                    />
                </div>
                <DescricaoFormal
                    tupla={`M = (Q, Σ, δ, ${form.estadoInicial.trim() || "q0"}, F)`}
                    itens={[
                        [`|Q| = ${estados.length}`, "quantidade de estados"],
                        [`Q = ${conjunto(estados)}`, "estados"],
                        [`Σ = ${conjunto(sigma)}`, "alfabeto"],
                        [`F = ${conjunto(finais)}`, "estados finais"]
                    ]}
                />
            </Quadro>

            <CaixaResultado dados={resultado} titulos={{ aceita: "ACEITA", rejeita: "REJEITA" }}>
                <p className="caminho mono">{resultado?.caminho}</p>
                <PassoAPasso total={passos.length} indice={passo} aoMudar={setPasso} />
                {atual && (
                    <div className="config-atual">
                        <div>
                            <span className="cartao-rotulo">Entrada</span>
                            <Fita simbolos={cadeia} cabecote={passo < cadeia.length ? passo : -1} consumidos={passo} />
                        </div>
                        <div>
                            <span className="cartao-rotulo">{form.tipo === "AFD" ? "Estado atual" : "Estados ativos"}</span>
                            <p className="estado-grande">{atual.depois.length ? conjunto(atual.depois) : "∅"}</p>
                        </div>
                    </div>
                )}
                <h3>Transições executadas</h3>
                <div className="tabela-wrap">
                    <table className="tabela-passos">
                        <thead>
                            <tr><th>Passo</th><th>Antes</th><th>Lê</th><th>Depois</th><th>Resta ler</th></tr>
                        </thead>
                        <tbody>
                            {passos.map((p) => (
                                <tr key={p.numero} className={p.numero === passo ? "selecionado" : ""} onClick={() => setPasso(p.numero)}>
                                    <td>{p.numero}</td>
                                    <td>{p.numero === 0 ? "—" : conjunto(p.antes)}</td>
                                    <td className="mono">{p.lido ?? "—"}</td>
                                    <td>{p.depois.length ? conjunto(p.depois) : "∅"}</td>
                                    <td className="mono">{p.restante}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CaixaResultado>
        </form>
    );
}
