/*
 * Casca da aplicação: cabeçalho e abas, na ordem da apresentação pedida no
 * enunciado. A aba aberta fica no endereço (#mt, #ap...) para sobreviver
 * a um recarregamento. Todas as abas continuam montadas (só escondidas),
 * assim o que foi digitado numa aba não se perde ao trocar de aba.
 *
 * Movimento (padrões "Tabs sliding" e "Page side-by-side" do transitions.dev,
 * tempos do taste-skill): um indicador desliza até a aba clicada só com
 * transform (240ms), o título do módulo entra com o BlurText do React Bits e
 * o painel aparece com fade curto. Com movimento reduzido, nada se desloca.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Linguagens from "./modulos/Linguagens.jsx";
import AutomatoFinito from "./modulos/AutomatoFinito.jsx";
import Gramatica from "./modulos/Gramatica.jsx";
import AutomatoPilha from "./modulos/AutomatoPilha.jsx";
import MaquinaTuring from "./modulos/MaquinaTuring.jsx";
import BlurText from "./components/reactbits/BlurText.jsx";

const ABAS = [
    { id: "linguagens", numero: 1, titulo: "Linguagens Formais", curto: "Linguagens", Componente: Linguagens },
    { id: "af", numero: 2, titulo: "Autômato Finito", curto: "AFD / AFN", Componente: AutomatoFinito },
    { id: "glc", numero: 3, titulo: "Gramática Livre de Contexto", curto: "GLC", Componente: Gramatica },
    { id: "ap", numero: 4, titulo: "Autômato com Pilha", curto: "AP", Componente: AutomatoPilha },
    { id: "mt", numero: 5, titulo: "Máquina de Turing", curto: "MT", Componente: MaquinaTuring }
];

function abaDoEndereco() {
    const id = window.location.hash.replace("#", "");
    return ABAS.some((a) => a.id === id) ? id : "linguagens";
}

function useIndicador(aba) {
    const nav = useRef(null);
    const [posicao, setPosicao] = useState(null);

    useLayoutEffect(() => {
        const medir = () => {
            const ativa = nav.current?.querySelector(".aba.ativa");
            if (ativa) {
                setPosicao({ x: ativa.offsetLeft, largura: ativa.offsetWidth });
                ativa.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
        };
        medir();
        window.addEventListener("resize", medir);
        document.fonts?.ready.then(medir);
        return () => window.removeEventListener("resize", medir);
    }, [aba]);

    return [nav, posicao];
}

export default function App() {
    const [aba, setAba] = useState(abaDoEndereco);
    const [nav, posicao] = useIndicador(aba);

    useEffect(() => {
        const aoMudar = () => setAba(abaDoEndereco());
        window.addEventListener("hashchange", aoMudar);
        return () => window.removeEventListener("hashchange", aoMudar);
    }, []);

    const atual = ABAS.find((a) => a.id === aba);

    return (
        <div className="app">
            <a className="pular" href="#conteudo">Pular para o conteúdo</a>
            <header className="topo">
                <div className="topo-conteudo">
                    <p className="etiqueta">Aspectos Teóricos da Computação</p>
                    <h1>Simulador de Linguagens Formais e Modelos Computacionais</h1>
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

            <main className="pagina" id="conteudo" tabIndex={-1}>
                <div className="modulo-cabeca">
                    <p className="etiqueta">Módulo {atual.numero} de {ABAS.length}</p>
                    <BlurText
                        key={atual.id}
                        as="h2"
                        text={atual.titulo}
                        className="modulo-titulo"
                        trigger="load"
                        delay={60}
                        stepDuration={0.3}
                        blur={8}
                        distance={14}
                    />
                </div>
                {ABAS.map(({ id, Componente }) => (
                    <div key={id} hidden={id !== aba} className={id === aba ? "painel-modulo entra" : "painel-modulo"}>
                        <Componente />
                    </div>
                ))}
            </main>
        </div>
    );
}
