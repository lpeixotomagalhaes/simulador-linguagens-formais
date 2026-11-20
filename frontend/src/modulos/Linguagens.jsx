/*
 * Módulo 1: Linguagens formais. Define Σ e uma linguagem L finita, valida
 * a cadeia contra Σ e mostra |w|, w·v, Σ* e Σ+ (até o comprimento k).
 */
import { useState } from "react";
import { enviar } from "../api.js";
import { CaixaResultado, Campo, Exemplos, Numero, Quadro, conjunto, lerAlfabeto } from "../components/Comuns.jsx";
import { EXEMPLOS_LINGUAGEM } from "../exemplos.js";

const INICIAL = EXEMPLOS_LINGUAGEM[0].dados;

function Cadeias({ lista, truncado }) {
    return (
        <div className="cadeias">
            {lista.map((c, i) => (
                <span key={i} className={"chip-cadeia" + (c === "λ" ? " lambda" : "")}>{c}</span>
            ))}
            {truncado && <span className="chip-cadeia mais">…</span>}
        </div>
    );
}

export default function Linguagens() {
    const [form, setForm] = useState(INICIAL);
    const [resultado, setResultado] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const mudar = (chave) => (valor) => setForm({ ...form, [chave]: valor });
    const sigma = lerAlfabeto(form.alfabeto);

    const analisar = async (evento) => {
        evento?.preventDefault();
        setCarregando(true);
        setResultado(await enviar("/api/linguagem", { ...form, k: Number(form.k) }));
        setCarregando(false);
    };

    const r = resultado;
    return (
        <form onSubmit={analisar}>
            <Quadro
                titulo="Alfabeto, linguagem e cadeias"
                descricao="Σ é um conjunto finito de símbolos. Uma linguagem L é um subconjunto de Σ*. Use λ para a cadeia vazia."
                acoes={<Exemplos exemplos={EXEMPLOS_LINGUAGEM} aoEscolher={(ex) => { setForm(ex.dados); setResultado(null); }} />}
            >
                <div className="metadados">
                    <Campo rotulo="Alfabeto (Σ)" valor={form.alfabeto} aoMudar={mudar("alfabeto")} placeholder="a,b"
                        dica={sigma.length ? `Σ = ${conjunto(sigma)}, |Σ| = ${sigma.length}` : "Separe os símbolos por vírgula."} />
                    <Campo rotulo="Linguagem L (finita, opcional)" valor={form.linguagem} aoMudar={mudar("linguagem")}
                        placeholder="ab, ba, λ" dica="Cadeias separadas por vírgula." />
                    <Campo rotulo="Cadeia w" valor={form.cadeia} aoMudar={mudar("cadeia")} placeholder="abba" mono />
                    <Campo rotulo="Cadeia v (para a concatenação w·v)" valor={form.cadeia2} aoMudar={mudar("cadeia2")} placeholder="ab" mono />
                    <label>
                        Comprimento máximo k para listar Σ* e Σ+
                        <select value={form.k} onChange={(e) => mudar("k")(e.target.value)}>
                            {[1, 2, 3, 4, 5, 6].map((k) => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                </div>
                <div className="acoes-form">
                    <button type="submit" className="botao-reconhecer" disabled={carregando}>
                        {carregando ? "Analisando..." : "Analisar cadeia"}
                    </button>
                </div>
            </Quadro>

            <CaixaResultado dados={r} titulos={{ aceita: "Cadeia válida para Σ", rejeita: "Cadeia inválida para Σ" }}>
                <div className="cartoes">
                    <div className="cartao">
                        <span className="cartao-rotulo">Tamanho</span>
                        <span className="cartao-valor">|{r?.cadeia}| = <Numero valor={r?.tamanho} /></span>
                    </div>
                    <div className="cartao">
                        <span className="cartao-rotulo">w ∈ L?</span>
                        <span className="cartao-valor">
                            {r?.pertenceL == null ? "L não informada" : r.pertenceL ? "Sim, w ∈ L" : "Não, w ∉ L"}
                        </span>
                    </div>
                    <div className="cartao">
                        <span className="cartao-rotulo">Concatenação w·v</span>
                        <span className="cartao-valor">{r?.cadeia}·{r?.cadeia2} = {r?.concatenacao}</span>
                        <span className="cartao-nota">|w·v| = |w| + |v| = <Numero valor={r?.tamanhoConcatenacao} />
                            {r && !r.cadeia2Valida && " (v tem símbolo fora de Σ)"}</span>
                    </div>
                </div>
                {r?.linguagem?.length > 0 && (
                    <>
                        <h3>L = {conjunto(r.linguagem)}</h3>
                        <p className="dica">|L| = {r.linguagem.length}</p>
                    </>
                )}
                <h3>Σ* (cadeias de comprimento 0 a {r?.k})</h3>
                <p className="dica">Σ* = Σ⁰ ∪ Σ¹ ∪ Σ² ∪ … inclui a cadeia vazia λ. É infinito, por isso a lista para em k.</p>
                <Cadeias lista={r?.sigmaEstrela || []} truncado={r?.truncado} />
                <h3>Σ+ (comprimento 1 a {r?.k})</h3>
                <p className="dica">Σ+ = Σ* − {"{λ}"}.</p>
                <Cadeias lista={r?.sigmaMais || []} truncado={r?.truncado} />
            </CaixaResultado>
        </form>
    );
}
