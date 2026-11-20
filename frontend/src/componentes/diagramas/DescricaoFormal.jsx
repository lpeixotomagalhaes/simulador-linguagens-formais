/* Descrição formal do modelo: a tupla, como M = (Q, Σ, δ, q0, F), e os conjuntos. */
export default function DescricaoFormal({ tupla, itens }) {
    return (
        <div className="descricao">
            <p className="tupla">{tupla}</p>
            <div className="descricao-grade">
                {itens.map(([simbolo, legenda]) => (
                    <div className="bloco-formal" key={legenda}>
                        <p className="simbolo-formal">{simbolo}</p>
                        <p className="legenda-formal">{legenda}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
