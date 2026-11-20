/*
 * Módulo 4: Autômato com pilha. Mostra, a cada passo, a leitura, o estado
 * e o conteúdo da pilha, além do diagrama com o estado atual destacado.
 */
import { useState } from "react";
import { enviar } from "../api/cliente.js";
import CaixaResultado from "../componentes/simulacao/CaixaResultado.jsx";
import Campo from "../componentes/formulario/Campo.jsx";
import DescricaoFormal from "../componentes/diagramas/DescricaoFormal.jsx";
import Exemplos from "../componentes/formulario/Exemplos.jsx";
import Fita from "../componentes/simulacao/Fita.jsx";
import Numero from "../componentes/simulacao/Numero.jsx";
import PassoAPasso from "../componentes/simulacao/PassoAPasso.jsx";
import Pilha from "../componentes/simulacao/Pilha.jsx";
import Quadro from "../componentes/layout/Quadro.jsx";
import { LAMBDA, conjunto, ehLambda, lerAlfabeto } from "../utilitarios/simbolos.js";
import DiagramaEstados, { listaEstados, montarEstados } from "../componentes/diagramas/DiagramaEstados.jsx";
import TabelaTransicoes, { comIds } from "../componentes/formulario/TabelaTransicoes.jsx";
import { EXEMPLOS_AP } from "../dados/exemplos.js";

const COLUNAS = [
    { chave: "origem", titulo: "Estado", placeholder: "q0" },
    { chave: "le", titulo: "Lê", placeholder: "a ou λ" },
    { chave: "desempilha", titulo: "Desempilha (topo)", placeholder: "Z ou λ" },
    { chave: "destino", titulo: "Novo estado", placeholder: "q1" },
    { chave: "empilha", titulo: "Empilha", placeholder: "AZ ou λ" }
];

const mostrar = (s) => (ehLambda(s) ? LAMBDA : s.trim());

function carregar(dados) {
    return { ...dados, transicoes: comIds(dados.transicoes) };
}

export default function AutomatoPilha() {
    const [form, setForm] = useState(() => carregar(EXEMPLOS_AP[0].dados));
    const [resultado, setResultado] = useState(null);
    const [passo, setPasso] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const mudar = (chave) => (valor) => {
        setForm({ ...form, [chave]: valor });
        setResultado(null);
    };

    const sigma = lerAlfabeto(form.alfabeto);
    const gamma = lerAlfabeto(form.alfabetoPilha);
    const finais = form.criterio === "pilha" ? [] : listaEstados(form.estadosFinais);
    const arestas = form.transicoes
        .filter((t) => t.origem.trim() && t.destino.trim())
        .map((t) => ({
            de: t.origem.trim(),
            para: t.destino.trim(),
            rotulo: `${mostrar(t.le)}, ${mostrar(t.desempilha)} → ${mostrar(t.empilha)}`
        }));
    const estados = montarEstados(form.estadoInicial, arestas, finais);

    const simular = async (evento) => {
        evento?.preventDefault();
        setCarregando(true);
        const { transicoes, ...resto } = form;
        const dados = await enviar("/api/pilha/simular", {
            ...resto,
            transicoes: transicoes.map(({ id, ...t }) => t)
        });
        setResultado(dados);
        setPasso(0);
        setCarregando(false);
    };

    const passos = resultado?.passos || [];
    const atual = passos[passo];
    const cadeia = ehLambda(form.cadeia) ? [] : [...form.cadeia.trim()];
    const lidos = atual ? cadeia.length - (atual.restante === LAMBDA ? 0 : atual.restante.length) : 0;

    return (
        <form onSubmit={simular}>
            <Quadro
                titulo="Definição do autômato com pilha"
                descricao="M = (Q, Σ, Γ, δ, q0, Z, F). Cada transição lê um símbolo (ou λ), desempilha o topo (ou λ) e empilha uma palavra de Γ*; o primeiro símbolo empilhado fica no topo."
                acoes={<Exemplos exemplos={EXEMPLOS_AP} aoEscolher={(ex) => { setForm(carregar(ex.dados)); setResultado(null); }} />}
            >
                <div className="metadados tres">
                    <Campo rotulo="Alfabeto de entrada (Σ)" valor={form.alfabeto} aoMudar={mudar("alfabeto")} placeholder="a,b" />
                    <Campo rotulo="Alfabeto da pilha (Γ)" valor={form.alfabetoPilha} aoMudar={mudar("alfabetoPilha")} placeholder="A,Z" />
                    <Campo rotulo="Símbolo inicial da pilha (Z)" valor={form.simboloPilha} aoMudar={mudar("simboloPilha")} placeholder="Z" maxLength={1} />
                    <Campo rotulo="Estado inicial (q0)" valor={form.estadoInicial} aoMudar={mudar("estadoInicial")} placeholder="q0" />
                    <label>
                        Critério de aceitação
                        <select value={form.criterio} onChange={(e) => mudar("criterio")(e.target.value)}>
                            <option value="estado">Estado final</option>
                            <option value="pilha">Pilha vazia</option>
                        </select>
                    </label>
                    <Campo
                        rotulo="Estados finais (F)"
                        valor={form.estadosFinais}
                        aoMudar={mudar("estadosFinais")}
                        placeholder="q2"
                        disabled={form.criterio === "pilha"}
                        dica={form.criterio === "pilha" ? "Não usado na aceitação por pilha vazia." : "Separe por vírgula."}
                    />
                </div>

                <TabelaTransicoes
                    colunas={COLUNAS}
                    linhas={form.transicoes}
                    aoMudar={(transicoes) => { setForm({ ...form, transicoes }); setResultado(null); }}
                    dica="δ(estado, lê, desempilha) = (novo estado, empilha). O autômato pode ser não determinístico: o simulador explora todas as escolhas em largura."
                />

                <div className="entrada">
                    <Campo rotulo="Cadeia de entrada" valor={form.cadeia} aoMudar={mudar("cadeia")} placeholder="aabb (λ para vazia)" mono />
                    <button type="submit" className="botao-reconhecer" disabled={carregando}>
                        {carregando ? "Executando..." : "Executar cadeia"}
                    </button>
                </div>
            </Quadro>

            <Quadro titulo="Diagrama de estados" descricao="Rótulo das setas: lê, desempilha → empilha.">
                <div className="diagrama">
                    <DiagramaEstados
                        estados={estados}
                        inicial={form.estadoInicial.trim()}
                        finais={finais}
                        arestas={arestas}
                        ativos={atual ? [atual.estado] : []}
                        rotuloAria="Diagrama do autômato com pilha"
                    />
                </div>
                <DescricaoFormal
                    tupla={`M = (Q, Σ, Γ, δ, ${form.estadoInicial.trim() || "q0"}, ${form.simboloPilha || "Z"}, F)`}
                    itens={[
                        [`|Q| = ${estados.length}`, "quantidade de estados"],
                        [`Q = ${conjunto(estados)}`, "estados"],
                        [`Σ = ${conjunto(sigma)}`, "alfabeto de entrada"],
                        [`Γ = ${conjunto(gamma)}`, "alfabeto da pilha"],
                        [form.criterio === "pilha" ? "F = ∅" : `F = ${conjunto(finais)}`, form.criterio === "pilha" ? "aceita por pilha vazia" : "estados finais"]
                    ]}
                />
            </Quadro>

            <CaixaResultado dados={resultado} titulos={{ aceita: "ACEITA", rejeita: "REJEITA" }}>
                {resultado?.tipo === "rejeita" && passos.length > 0 && (
                    <p className="dica">O passo a passo abaixo mostra o caminho que mais avançou antes de travar.</p>
                )}
                <PassoAPasso total={passos.length} indice={passo} aoMudar={setPasso} />
                {atual && (
                    <div className="config-atual com-pilha">
                        <div>
                            <span className="cartao-rotulo">Leitura</span>
                            <Fita simbolos={cadeia} cabecote={lidos < cadeia.length ? lidos : -1} consumidos={lidos} />
                            <p className="dica">
                                {passo === 0 ? "Configuração inicial." : <>Leu <strong>{atual.lido}</strong> usando {atual.transicao}</>}
                            </p>
                            <span className="cartao-rotulo">Estado</span>
                            <p className="estado-grande">{atual.estado}</p>
                        </div>
                        <div>
                            <span className="cartao-rotulo">Conteúdo da pilha</span>
                            <Pilha conteudo={atual.pilha} />
                        </div>
                    </div>
                )}
                <h3>Configurações</h3>
                <div className="tabela-wrap">
                    <table className="tabela-passos">
                        <thead>
                            <tr><th>Passo</th><th>Estado</th><th>Leitura</th><th>Resta ler</th><th>Pilha (topo à esquerda)</th><th>Transição</th></tr>
                        </thead>
                        <tbody>
                            {passos.map((p) => (
                                <tr key={p.numero} className={p.numero === passo ? "selecionado" : ""} onClick={() => setPasso(p.numero)}>
                                    <td>{p.numero}</td>
                                    <td>{p.estado}</td>
                                    <td className="mono">{p.numero === 0 ? "—" : p.lido}</td>
                                    <td className="mono">{p.restante}</td>
                                    <td className="mono">{p.pilha || LAMBDA}</td>
                                    <td className="mono pequeno">{p.transicao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="dica">Configurações exploradas pela busca: <Numero valor={resultado?.configuracoesExploradas} /></p>
            </CaixaResultado>
        </form>
    );
}
