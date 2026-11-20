/*
 * Casca da aplicação: cabeçalho e abas, na ordem da apresentação pedida no
 * enunciado. A aba aberta fica no endereço (#mt, #ap...) para sobreviver
 * a um recarregamento. Todas as abas continuam montadas (só escondidas),
 * assim o que foi digitado numa aba não se perde ao trocar de aba.
 *
 * Troca de aba: um indicador desliza até a aba clicada (240ms), toca um som
 * curto, o título antigo some e o novo sobe letra por letra (TituloAnimado),
 * e o painel aparece com fade curto. O som pode ser desligado no cabeçalho;
 * a escolha fica guardada no navegador. Com movimento reduzido, nada se desloca.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Linguagens from "./modulos/Linguagens.jsx";
import AutomatoFinito from "./modulos/AutomatoFinito.jsx";
import Gramatica from "./modulos/Gramatica.jsx";
import AutomatoPilha from "./modulos/AutomatoPilha.jsx";
import MaquinaTuring from "./modulos/MaquinaTuring.jsx";
import TituloAnimado from "./components/TituloAnimado.jsx";

const ABAS = [
    { id: "linguagens", numero: 1, titulo: "Linguagens Formais", curto: "Linguagens", Componente: Linguagens },
    { id: "af", numero: 2, titulo: "Autômato Finito", curto: "AFD / AFN", Componente: AutomatoFinito },
    { id: "glc", numero: 3, titulo: "Gramática Livre de Contexto", curto: "GLC", Componente: Gramatica },
    { id: "ap", numero: 4, titulo: "Autômato com Pilha", curto: "AP", Componente: AutomatoPilha },
    { id: "mt", numero: 5, titulo: "Máquina de Turing", curto: "MT", Componente: MaquinaTuring }
];

const SOM_TROCA = import.meta.env.BASE_URL + "sons/troca-aba.mp3";

function abaDoEndereco() {
    const id = window.location.hash.replace("#", "");
    return ABAS.some((a) => a.id === id) ? id : "linguagens";
}

function lerPreferenciaSom() {
    try {
        return localStorage.getItem("som-abas") !== "desligado";
    } catch {
        return true;
    }
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

/* Som da troca de aba. Só toca depois da primeira aba (não toca ao abrir a página). */
function useSomTroca(aba, ligado) {
    const audio = useRef(null);
    const anterior = useRef(aba);

    useEffect(() => {
        audio.current = new Audio(SOM_TROCA);
        audio.current.volume = 0.35;
        audio.current.preload = "auto";
    }, []);

    useEffect(() => {
        if (anterior.current === aba) {
            return;
        }
        anterior.current = aba;
        if (ligado && audio.current) {
            audio.current.currentTime = 0;
            audio.current.play().catch(() => {});
        }
    }, [aba, ligado]);
}

export default function App() {
    const [aba, setAba] = useState(abaDoEndereco);
    const [somLigado, setSomLigado] = useState(lerPreferenciaSom);
    const [nav, posicao] = useIndicador(aba);
    useSomTroca(aba, somLigado);

    useEffect(() => {
        const aoMudar = () => setAba(abaDoEndereco());
        window.addEventListener("hashchange", aoMudar);
        return () => window.removeEventListener("hashchange", aoMudar);
    }, []);

    const alternarSom = () => {
        const novo = !somLigado;
        setSomLigado(novo);
        try {
            localStorage.setItem("som-abas", novo ? "ligado" : "desligado");
        } catch {
            /* sem armazenamento: a escolha vale só nesta visita */
        }
    };

    const atual = ABAS.find((a) => a.id === aba);

    return (
        <div className="app">
            <a className="pular" href="#conteudo">Pular para o conteúdo</a>
            <header className="topo">
                <div className="topo-conteudo">
                    <div>
                        <p className="etiqueta">Aspectos Teóricos da Computação</p>
                        <h1>Simulador de Linguagens Formais e Modelos Computacionais</h1>
                    </div>
                    <button
                        type="button"
                        className="botao-som"
                        onClick={alternarSom}
                        aria-pressed={somLigado}
                        title={somLigado ? "Desligar o som da troca de aba" : "Ligar o som da troca de aba"}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
                            {somLigado
                                ? <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" className="som-ondas" />
                                : <path d="M16 9.5l5 5M21 9.5l-5 5" className="som-ondas" />}
                        </svg>
                        <span className="sr-only">{somLigado ? "Som ligado" : "Som desligado"}</span>
                    </button>
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
                    <p key={atual.id} className="etiqueta etiqueta-troca">Módulo {atual.numero} de {ABAS.length}</p>
                    <TituloAnimado texto={atual.titulo} className="modulo-titulo" />
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
