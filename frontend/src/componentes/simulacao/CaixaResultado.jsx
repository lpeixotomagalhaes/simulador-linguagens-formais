/*
 * Caixa de resultado (aceita, rejeita ou erro de configuração), logo abaixo
 * do quadro com o botão que executa a simulação.
 *
 * Ao surgir, a caixa se abre em altura (o que está abaixo desce suave em vez
 * de saltar) e a página rola o mínimo para mostrar o começo dela, assim fica
 * claro que o botão funcionou. Cada resposta nova entra com um fade curto;
 * erro de configuração treme uma vez. O ícone é desenhado com traço:
 * ✓ aceita, ✕ rejeita, ! erro.
 */
import { useEffect, useRef, useState } from "react";

const TITULOS = { aceita: "Aceita", rejeita: "Rejeita", erro: "Configuração inválida" };

function IconeResultado({ tipo }) {
    const caminhos = {
        aceita: ["M7 12.5l3.2 3.2L17 9"],
        rejeita: ["M8.5 8.5l7 7", "M15.5 8.5l-7 7"],
        erro: ["M12 7.5v5.5", "M12 16.4v.1"]
    }[tipo] || [];
    return (
        <svg className="icone-resultado" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" className="icone-aro" />
            {caminhos.map((d, i) => (
                <path key={i} d={d} className="icone-traco" style={{ animationDelay: `${180 + i * 90}ms` }} pathLength="1" />
            ))}
        </svg>
    );
}

export default function CaixaResultado({ dados, titulos = TITULOS, children }) {
    // Cada resposta nova troca a chave e reinicia a animação de entrada.
    const [execucao, setExecucao] = useState(0);
    const envelope = useRef(null);

    useEffect(() => {
        if (!dados) return undefined;
        setExecucao((n) => n + 1);
        // Espera a caixa começar a abrir e rola só o necessário para mostrá-la.
        const t = setTimeout(() => envelope.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
        return () => clearTimeout(t);
    }, [dados]);

    if (!dados) {
        return null;
    }
    const tipo = dados.tipo || "erro";
    return (
        <div className="resultado-envelope" ref={envelope}>
            <div className="resultado-envelope-interno">
                <section key={execucao} className={"resultado entra " + tipo} aria-live="polite">
                    <p className="etiqueta">Resultado</p>
                    <h2 className="status">
                        <IconeResultado tipo={tipo} />
                        {titulos[tipo] || TITULOS[tipo]}
                    </h2>
                    <p className="motivo">{dados.motivo}</p>
                    {tipo !== "erro" && children}
                </section>
            </div>
        </div>
    );
}
