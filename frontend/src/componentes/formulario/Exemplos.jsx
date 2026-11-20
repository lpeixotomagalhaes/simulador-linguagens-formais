/* Botões "Carregar exemplo" de cada módulo. */
export default function Exemplos({ exemplos, aoEscolher }) {
    return (
        <div className="exemplos">
            <span className="exemplos-rotulo">Carregar exemplo:</span>
            {exemplos.map((ex) => (
                <button type="button" key={ex.nome} className="chip" onClick={() => aoEscolher(ex)} title={ex.descricao}>
                    {ex.nome}
                </button>
            ))}
        </div>
    );
}
