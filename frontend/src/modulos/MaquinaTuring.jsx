/*
 * Módulo 5: Máquina de Turing. Porta para React da página original
 * (static/js/app.js + diagrama.js): mesma validação ao vivo, modo
 * qaceita/qrejeita ou somente qfinal, branco escrito B e mostrado ⊔,
 * aviso de transição duplicada (máquina determinística). A novidade é a
 * fita animada passo a passo e os exemplos das opções A e B do enunciado.
 */
import { useMemo, useState } from "react";
import { enviar } from "../api/cliente.js";
import CaixaResultado from "../componentes/simulacao/CaixaResultado.jsx";
import Campo from "../componentes/formulario/Campo.jsx";
import DescricaoFormal from "../componentes/diagramas/DescricaoFormal.jsx";
import Exemplos from "../componentes/formulario/Exemplos.jsx";
import Fita from "../componentes/simulacao/Fita.jsx";
import Numero from "../componentes/simulacao/Numero.jsx";
import PassoAPasso from "../componentes/simulacao/PassoAPasso.jsx";
import Quadro from "../componentes/layout/Quadro.jsx";
import { BRANCO, conjunto, lerAlfabeto } from "../utilitarios/simbolos.js";
import DiagramaEstados, { ehEstado, montarEstados } from "../componentes/diagramas/DiagramaEstados.jsx";
import TabelaTransicoes, { comIds } from "../componentes/formulario/TabelaTransicoes.jsx";
import { EXEMPLOS_MT, montarExemploMT, nomesFinais } from "../dados/exemplos.js";

const SIMBOLOS_BRANCO = new Set(["B", "⊔", "□", "⌴"]);
const visual = (s) => (SIMBOLOS_BRANCO.has((s || "").trim()) ? BRANCO : (s || "").trim());
const paraMaquina = (s) => (SIMBOLOS_BRANCO.has((s || "").trim()) ? "B" : (s || "").trim());

const COLUNAS = [
    { chave: "estadoInicial", titulo: "Estado atual", placeholder: "q0" },
    { chave: "simboloLido", titulo: "Símbolo lido", placeholder: "0" },
    { chave: "novoEstado", titulo: "Novo estado", placeholder: "q1" },
    { chave: "simboloEscrito", titulo: "Símbolo escrito", placeholder: "0" },
    {
        chave: "movimento",
        titulo: "Movimento",
        largura: "10rem",
        opcoes: [{ valor: "D", rotulo: "Direita (D)" }, { valor: "E", rotulo: "Esquerda (E)" }]
    }
];

function rotulo(t) {
    const lido = visual(t.simboloLido);
    const escrito = visual(t.simboloEscrito);
    const mov = t.movimento === "E" ? "E" : "D";
    return lido === escrito ? `${lido}→${mov}` : `${lido}→${escrito},${mov}`;
}

/*
 * Carrega um exemplo no modo de estados finais escolhido. `exemplo` guarda
 * qual exemplo está na tela enquanto o usuário não editar a máquina; assim a
 * troca de modo remonta o exemplo com ou sem as transições para qrejeita.
 */
function carregarExemplo(exemplo, modo) {
    const dados = montarExemploMT(exemplo, modo);
    return { ...dados, transicoes: comIds(dados.transicoes), exemplo };
}

/*
 * Troca o modo de uma máquina digitada pelo usuário: o estado de aceitação
 * muda de nome também nas transições (qaceita <-> qfinal), e ao passar para
 * "somente qfinal" as transições para o estado de rejeição saem, porque
 * nesse modo a falta de transição já rejeita.
 */
function trocarModoManual(form, modo) {
    const { aceita, rejeita } = nomesFinais(modo);
    const aceitaAntiga = form.aceita.trim();
    const rejeitaAntiga = form.rejeita.trim();
    const renomear = (estado) => (estado.trim() === aceitaAntiga ? aceita : estado);
    const transicoes = form.transicoes
        .filter((t) => modo === "par" || !rejeitaAntiga || t.novoEstado.trim() !== rejeitaAntiga)
        .map((t) => ({ ...t, estadoInicial: renomear(t.estadoInicial), novoEstado: renomear(t.novoEstado) }));
    return { ...form, modo, aceita, rejeita, transicoes };
}

export default function MaquinaTuring() {
    const [form, setForm] = useState(() => carregarExemplo(EXEMPLOS_MT[0], "par"));
    const [resultado, setResultado] = useState(null);
    const [passo, setPasso] = useState(0);
    const [carregando, setCarregando] = useState(false);
    // Editar a máquina desliga o vínculo com o exemplo; a cadeia pode mudar à vontade.
    const mudar = (chave) => (valor) => {
        setForm({ ...form, [chave]: valor, exemplo: chave === "cadeia" ? form.exemplo : null });
        setResultado(null);
    };
    const trocarModo = (modo) => {
        if (modo === form.modo) return;
        setForm(form.exemplo
            ? { ...carregarExemplo(form.exemplo, modo), cadeia: form.cadeia }
            : trocarModoManual(form, modo));
        setResultado(null);
    };

    const sigma = lerAlfabeto(form.alfabeto);
    const erroAlfabeto = sigma.some((s) => SIMBOLOS_BRANCO.has(s))
        ? "O branco da fita (B ou ⊔) não faz parte do alfabeto reconhecido."
        : sigma.some((s) => s.length !== 1) ? "Cada símbolo do alfabeto deve ter um caractere." : null;
    const foraDeSigma = [...form.cadeia].find((s) => !sigma.includes(s));
    const aceita = form.aceita.trim();
    const rejeita = form.modo === "par" ? form.rejeita.trim() : "";

    // Mesmas regras da página antiga: estados válidos, símbolo de um caractere
    // e no máximo uma transição por (estado, símbolo lido).
    const erros = useMemo(() => {
        const mapa = {};
        const marcar = (id, chave, msg) => {
            mapa[id] = { ...(mapa[id] || {}), [chave]: msg };
        };
        const grupos = new Map();
        form.transicoes.forEach((t) => {
            ["estadoInicial", "novoEstado"].forEach((c) => {
                if (t[c].trim() && !ehEstado(t[c])) marcar(t.id, c, "Use letra seguida de letras, números ou _.");
            });
            ["simboloLido", "simboloEscrito"].forEach((c) => {
                if (t[c].trim().length > 1) marcar(t.id, c, "Um caractere só.");
            });
            if (ehEstado(t.estadoInicial) && t.simboloLido.trim().length === 1) {
                const chave = t.estadoInicial.trim() + "\u0000" + paraMaquina(t.simboloLido);
                grupos.set(chave, [...(grupos.get(chave) || []), t]);
            }
        });
        grupos.forEach((itens) => {
            if (itens.length > 1) {
                itens.forEach((t) => marcar(t.id, "simboloLido",
                    `${t.estadoInicial.trim()} já tem transição lendo ${visual(t.simboloLido)}. A MT é determinística.`));
            }
        });
        return mapa;
    }, [form.transicoes]);

    const validas = form.transicoes.filter((t) =>
        ehEstado(t.estadoInicial) && ehEstado(t.novoEstado)
        && t.simboloLido.trim().length === 1 && t.simboloEscrito.trim().length === 1);
    const arestas = validas.map((t) => ({ de: t.estadoInicial.trim(), para: t.novoEstado.trim(), rotulo: rotulo(t) }));
    const estados = montarEstados(form.estadoInicial, arestas, [aceita, rejeita].filter(Boolean));
    const gamma = [...sigma];
    validas.forEach((t) => [t.simboloLido, t.simboloEscrito].forEach((s) => {
        const v = visual(s);
        if (v !== BRANCO && !gamma.includes(v)) gamma.push(v);
    }));

    const reconhecer = async (evento) => {
        evento?.preventDefault();
        setCarregando(true);
        const dados = await enviar("/api/turing/simular", {
            estadoInicial: form.estadoInicial,
            estadosFinais: aceita,
            estadosRejeita: rejeita,
            alfabeto: form.alfabeto,
            cadeia: form.cadeia,
            transicoes: form.transicoes.map((t) => ({
                estadoInicial: t.estadoInicial,
                simboloLido: paraMaquina(t.simboloLido),
                novoEstado: t.novoEstado,
                simboloEscrito: paraMaquina(t.simboloEscrito),
                movimento: t.movimento
            }))
        });
        setResultado(dados);
        setPasso(dados.passos ? dados.passos.length : 0);
        setCarregando(false);
    };

    // Passo i < n: configuração antes da i-ésima regra. Passo n: configuração final.
    const passos = resultado?.passos || [];
    const final = passo >= passos.length;
    const config = final
        ? { fita: resultado?.fitaFinal || "", cabecote: resultado?.cabecoteFinal, estado: resultado?.estado }
        : passos[passo];
    const conteudoFinal = (resultado?.fitaFinal || "").replace(/B/g, "");

    return (
        <form onSubmit={reconhecer}>
            <Quadro
                titulo="Configuração da máquina"
                descricao="M = (Q, Σ, Γ, δ, q0, qaceita, qrejeita). O branco se escreve B nas transições e aparece como ⊔. Ele pertence a Γ, não a Σ."
                acoes={<Exemplos exemplos={EXEMPLOS_MT} aoEscolher={(ex) => { setForm(carregarExemplo(ex, form.modo)); setResultado(null); }} />}
            >
                <div className="metadados tres">
                    <Campo rotulo="Alfabeto reconhecido (Σ)" valor={form.alfabeto} aoMudar={mudar("alfabeto")} placeholder="0,1" erro={erroAlfabeto} />
                    <Campo rotulo="Estado inicial" valor={form.estadoInicial} aoMudar={mudar("estadoInicial")} placeholder="q0"
                        erro={form.estadoInicial && !ehEstado(form.estadoInicial) ? "Use letra seguida de letras, números ou _." : null} />
                    <fieldset className="alternador vertical">
                        <legend>Estados finais</legend>
                        <label className={form.modo === "par" ? "ativo" : ""}>
                            <input type="radio" name="modo-mt" checked={form.modo === "par"}
                                onChange={() => trocarModo("par")} />
                            qaceita e qrejeita
                        </label>
                        <label className={form.modo === "unico" ? "ativo" : ""}>
                            <input type="radio" name="modo-mt" checked={form.modo === "unico"}
                                onChange={() => trocarModo("unico")} />
                            somente qfinal
                        </label>
                    </fieldset>
                    <Campo rotulo={form.modo === "par" ? "Estado de aceitação" : "Estado final (aceita)"} valor={form.aceita}
                        aoMudar={mudar("aceita")} erro={!ehEstado(form.aceita) ? "Informe um estado de aceitação, como qaceita." : null} />
                    {form.modo === "par" && (
                        <Campo rotulo="Estado de rejeição" valor={form.rejeita} aoMudar={mudar("rejeita")}
                            erro={form.rejeita && form.rejeita.trim() === aceita ? "Não pode ser igual ao de aceitação." : null} />
                    )}
                </div>

                <TabelaTransicoes
                    colunas={COLUNAS}
                    linhas={form.transicoes}
                    aoMudar={(transicoes) => { setForm({ ...form, transicoes, exemplo: null }); setResultado(null); }}
                    erros={erros}
                    dica="O estado atual é de onde a regra sai. Cada estado só pode ter uma transição para o mesmo símbolo lido. Direita avança o cabeçote e esquerda recua. Sem regra aplicável, a máquina para e rejeita."
                />

                <div className="entrada">
                    <Campo rotulo="Cadeia de entrada" valor={form.cadeia} aoMudar={mudar("cadeia")} placeholder="000100" mono
                        erro={foraDeSigma ? `O símbolo “${foraDeSigma}” não pertence a Σ = ${conjunto(sigma)}.` : null} />
                    <button type="submit" className="botao-reconhecer" disabled={carregando}>
                        {carregando ? "Reconhecendo..." : "Reconhecer cadeia"}
                    </button>
                </div>
            </Quadro>

            <Quadro titulo="Diagrama de transições" descricao="Rótulo: lido→movimento, ou lido→escrito,movimento quando o símbolo muda. qrejeita aparece tracejado.">
                <div className="diagrama">
                    <DiagramaEstados
                        estados={estados}
                        inicial={form.estadoInicial.trim()}
                        finais={ehEstado(aceita) ? [aceita] : []}
                        rejeicao={rejeita ? [rejeita] : []}
                        arestas={arestas}
                        ativos={resultado && config ? [config.estado] : []}
                        rotuloAria="Diagrama de estados da máquina de Turing"
                    />
                </div>
                <DescricaoFormal
                    tupla={rejeita
                        ? `M = (Q, Σ, Γ, δ, ${form.estadoInicial.trim() || "q0"}, ${aceita}, ${rejeita})`
                        : `M = (Q, Σ, Γ, δ, ${form.estadoInicial.trim() || "q0"}, ${aceita})`}
                    itens={[
                        [`|Q| = ${estados.length}`, "quantidade de estados"],
                        [`Q = ${conjunto(estados)}`, "conjunto dos estados"],
                        [`Σ = ${conjunto(sigma)}`, "alfabeto reconhecido"],
                        [`Γ = ${conjunto([...gamma, BRANCO])}`, "alfabeto da fita"]
                    ]}
                />
            </Quadro>

            <CaixaResultado dados={resultado}>
                <h3>Fita</h3>
                <PassoAPasso total={passos.length + 1} indice={passo} aoMudar={setPasso} />
                {config && (
                    <>
                        <Fita simbolos={[...config.fita].map(visual)} cabecote={config.cabecote} />
                        <p className="dica">
                            {final
                                ? <>Configuração final, no estado <strong>{config.estado}</strong>. A célula escura é o cabeçote.</>
                                : <>No estado <strong>{config.estado}</strong>, lê <strong>{visual(config.simboloLido)}</strong>,
                                    escreve <strong>{visual(config.simboloEscrito)}</strong>, move para a {config.movimento === "E" ? "esquerda" : "direita"} e vai para <strong>{config.novoEstado}</strong>.</>}
                        </p>
                    </>
                )}
                <div className="cartoes">
                    <div className="cartao">
                        <span className="cartao-rotulo">Conteúdo final da fita (sem brancos)</span>
                        <span className="cartao-valor mono">{conteudoFinal || "vazia"}</span>
                    </div>
                    <div className="cartao">
                        <span className="cartao-rotulo">Transições aplicadas</span>
                        <span className="cartao-valor"><Numero valor={passos.length} /></span>
                    </div>
                </div>
                <h3>Transições executadas</h3>
                <div className="tabela-wrap">
                    <table className="tabela-passos">
                        <thead>
                            <tr><th>Passo</th><th>Estado</th><th>Lê</th><th>Escreve</th><th>Move</th><th>Novo estado</th></tr>
                        </thead>
                        <tbody>
                            {passos.map((p, i) => (
                                <tr key={p.numero} className={i === passo ? "selecionado" : ""} onClick={() => setPasso(i)}>
                                    <td>{p.numero}</td>
                                    <td>{p.estado}</td>
                                    <td className="mono">{visual(p.simboloLido)}</td>
                                    <td className="mono">{visual(p.simboloEscrito)}</td>
                                    <td>{p.movimento === "E" ? "E" : "D"}</td>
                                    <td>{p.novoEstado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CaixaResultado>
        </form>
    );
}
