/* Cartão de seção com título, descrição e ações (por exemplo, os botões de exemplo). */
export default function Quadro({ titulo, descricao, acoes, children, className = "" }) {
    return (
        <section className={"quadro " + className}>
            {(titulo || acoes) && (
                <div className="quadro-cabeca">
                    <div>
                        {titulo && <h2>{titulo}</h2>}
                        {descricao && <p>{descricao}</p>}
                    </div>
                    {acoes && <div className="quadro-acoes">{acoes}</div>}
                </div>
            )}
            {children}
        </section>
    );
}
