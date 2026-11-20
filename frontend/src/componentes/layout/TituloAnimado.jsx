/*
 * Título do módulo com a transição de troca de aba.
 *
 * Quando o texto muda, o título antigo some depressa (esmaece e sobe 4px em
 * 140ms) e o novo entra letra por letra, cada uma subindo de dentro de uma
 * máscara (o contêiner corta o que está abaixo da linha), da esquerda para a
 * direita, 24ms entre letras. Sem desfoque. Com movimento reduzido, o texto
 * só troca.
 */
import { useEffect, useRef, useState } from "react";

const SAIDA_MS = 140;

export default function TituloAnimado({ texto, className = "", as: Tag = "h2" }) {
    const [atual, setAtual] = useState(texto);
    const [saindo, setSaindo] = useState(null);
    const [chave, setChave] = useState(0);
    const primeiro = useRef(true);

    useEffect(() => {
        if (primeiro.current) {
            primeiro.current = false;
            return undefined;
        }
        if (texto === atual) {
            return undefined;
        }
        setSaindo(atual);
        const t = setTimeout(() => {
            setSaindo(null);
            setAtual(texto);
            setChave((k) => k + 1);
        }, SAIDA_MS);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [texto]);

    if (saindo !== null) {
        return (
            <Tag className={className + " titulo-animado saindo"} aria-label={texto}>
                <span aria-hidden="true">{saindo}</span>
            </Tag>
        );
    }

    // A primeira renderização (ao abrir a página) também anima, uma vez.
    // Cada palavra tem a sua máscara, para a quebra de linha só acontecer
    // entre palavras; o atraso das letras continua de uma palavra para a outra.
    let indice = 0;
    const palavras = atual.split(" ");
    return (
        <Tag key={chave} className={className + " titulo-animado"} aria-label={atual}>
            {palavras.map((palavra, p) => (
                <span key={p}>
                    <span className="titulo-mascara" aria-hidden="true">
                        {[...palavra].map((letra) => {
                            const atraso = indice++ * 24;
                            return (
                                <span key={atraso} className="titulo-letra" style={{ animationDelay: `${atraso}ms` }}>
                                    {letra}
                                </span>
                            );
                        })}
                    </span>
                    {p < palavras.length - 1 && " "}
                </span>
            ))}
        </Tag>
    );
}
