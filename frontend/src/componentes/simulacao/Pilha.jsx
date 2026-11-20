/* Pilha vertical, topo em cima. A String da API tem o topo no índice 0. */
export default function Pilha({ conteudo }) {
    const itens = [...(conteudo || "")];
    return (
        <div className="pilha" aria-label={"Pilha: " + (itens.join("") || "vazia")}>
            <span className="pilha-topo">topo</span>
            {itens.length === 0 && <div className="pilha-item vazia">vazia</div>}
            {itens.map((s, i) => (
                <div key={i} className={"pilha-item" + (i === 0 ? " topo" : "")}>{s}</div>
            ))}
            <div className="pilha-base" />
        </div>
    );
}
