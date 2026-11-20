/*
 * Casca da aplicação: cabeçalho, abas e o carrossel com as páginas dos
 * módulos, na ordem da apresentação pedida no enunciado.
 *
 * Na troca de aba: o indicador desliza até a aba clicada, toca um som curto,
 * o título sobe letra por letra e a página muda em carrossel. Em telas de
 * toque, deslizar o dedo para os lados também troca de aba.
 */
import { useCallback, useEffect, useRef } from "react";
import Linguagens from "./modulos/Linguagens.jsx";
import AutomatoFinito from "./modulos/AutomatoFinito.jsx";
import Gramatica from "./modulos/Gramatica.jsx";
import AutomatoPilha from "./modulos/AutomatoPilha.jsx";
import MaquinaTuring from "./modulos/MaquinaTuring.jsx";
import BotaoSom from "./componentes/layout/BotaoSom.jsx";
import Carrossel from "./componentes/layout/Carrossel.jsx";
import TituloAnimado from "./componentes/layout/TituloAnimado.jsx";
import useAbaDoEndereco from "./hooks/useAbaDoEndereco.js";
import useDeslizar from "./hooks/useDeslizar.js";
import useIndicadorDeAba from "./hooks/useIndicadorDeAba.js";
import useSomDeTroca from "./hooks/useSomDeTroca.js";

const ABAS = [
    { id: "linguagens", numero: 1, titulo: "Linguagens Formais", curto: "Linguagens", Componente: Linguagens },
    { id: "af", numero: 2, titulo: "Autômato Finito", curto: "AFD / AFN", Componente: AutomatoFinito },
    { id: "glc", numero: 3, titulo: "Gramática Livre de Contexto", curto: "GLC", Componente: Gramatica },
    { id: "ap", numero: 4, titulo: "Autômato com Pilha", curto: "AP", Componente: AutomatoPilha },
    { id: "mt", numero: 5, titulo: "Máquina de Turing", curto: "MT", Componente: MaquinaTuring }
];
const IDS = ABAS.map((a) => a.id);

export default function App() {
    const [aba, irPara] = useAbaDoEndereco(IDS, IDS[0]);
    const [nav, posicao] = useIndicadorDeAba(aba);
    const [somLigado, alternarSom] = useSomDeTroca(aba);
    const principal = useRef(null);
    const indice = IDS.indexOf(aba);

    const avancar = useCallback(() => indice < IDS.length - 1 && irPara(IDS[indice + 1]), [indice, irPara]);
    const voltar = useCallback(() => indice > 0 && irPara(IDS[indice - 1]), [indice, irPara]);
    useDeslizar(principal, { aoAvancar: avancar, aoVoltar: voltar });

    // A página nova começa do topo, como num carrossel.
    useEffect(() => {
        if (window.scrollY > 0) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [aba]);

    const atual = ABAS[indice];

    return (
        <div className="app">
            <a className="pular" href="#conteudo">Pular para o conteúdo</a>
            <header className="topo">
                <div className="topo-conteudo">
                    <div>
                        <p className="etiqueta">Aspectos Teóricos da Computação</p>
                        <h1>Simulador de Linguagens Formais e Modelos Computacionais</h1>
                    </div>
                    <BotaoSom ligado={somLigado} aoAlternar={alternarSom} />
                </div>
                <nav className="abas" aria-label="Módulos" ref={nav}>
                    {ABAS.map((a) => (
                        <a
                            key={a.id}
                            href={"#" + a.id}
                            className={"aba" + (a.id === aba ? " ativa" : "")}
                            aria-current={a.id === aba ? "page" : undefined}
                        >
                            <span className="aba-numero">{a.numero}</span>
                            <span className="aba-titulo">{a.curto}</span>
                        </a>
                    ))}
                    {posicao && (
                        <span
                            className="aba-indicador"
                            aria-hidden="true"
                            style={{ transform: `translateX(${posicao.x}px) scaleX(${posicao.largura})` }}
                        />
                    )}
                </nav>
            </header>

            <main className="pagina" id="conteudo" tabIndex={-1} ref={principal}>
                <div className="modulo-cabeca">
                    <p key={atual.id} className="etiqueta etiqueta-troca">Módulo {atual.numero} de {ABAS.length}</p>
                    <TituloAnimado texto={atual.titulo} className="modulo-titulo" />
                </div>
                <Carrossel paginas={ABAS} ativa={aba} />
            </main>
        </div>
    );
}
