/*
 * Quadro de transições editável, com as colunas definidas por cada módulo.
 *
 * colunas  [{ chave, titulo, placeholder, opcoes?: [{valor, rotulo}], largura? }]
 *          com `opcoes` a célula vira um select.
 * linhas   [{ id, ...valores }]
 * erros    mapa id → { chave: mensagem } para marcar células inválidas
 */
let proximoId = 1;

export function novaLinha(valores = {}) {
    return { id: proximoId++, ...valores };
}

export function comIds(lista) {
    return lista.map((valores) => novaLinha(valores));
}

export default function TabelaTransicoes({ colunas, linhas, aoMudar, erros = {}, dica }) {
    const alterar = (id, chave, valor) => {
        aoMudar(linhas.map((linha) => (linha.id === id ? { ...linha, [chave]: valor } : linha)));
    };
    const remover = (id) => aoMudar(linhas.filter((linha) => linha.id !== id));
    const adicionar = () => {
        const vazia = {};
        colunas.forEach((c) => {
            vazia[c.chave] = c.opcoes ? c.opcoes[0].valor : "";
        });
        aoMudar([...linhas, novaLinha(vazia)]);
    };

    return (
        <div className="bloco-transicoes">
            <div className="transicoes-cabeca">
                <h3>Transições (δ)</h3>
                <button type="button" className="botao-mais" onClick={adicionar}>
                    <span aria-hidden="true">+</span>
                    Adicionar transição
                </button>
            </div>
            <div className="tabela-wrap">
                <table className="tabela-edicao">
                    <thead>
                        <tr>
                            {colunas.map((c) => (
                                <th key={c.chave} style={c.largura ? { width: c.largura } : undefined}>{c.titulo}</th>
                            ))}
                            <th aria-label="Remover" style={{ width: "3rem" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={colunas.length + 1} className="tabela-vazia">
                                    Nenhuma transição. Use “Adicionar transição” ou carregue um exemplo.
                                </td>
                            </tr>
                        )}
                        {linhas.map((linha) => (
                            <tr key={linha.id}>
                                {colunas.map((c) => {
                                    const erro = erros[linha.id]?.[c.chave];
                                    return (
                                        <td key={c.chave} data-label={c.titulo}>
                                            {c.opcoes ? (
                                                <select
                                                    value={linha[c.chave]}
                                                    onChange={(e) => alterar(linha.id, c.chave, e.target.value)}
                                                    aria-label={c.titulo}
                                                >
                                                    {c.opcoes.map((o) => (
                                                        <option key={o.valor} value={o.valor}>{o.rotulo}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    value={linha[c.chave] ?? ""}
                                                    placeholder={c.placeholder}
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    aria-label={c.titulo}
                                                    aria-invalid={erro ? "true" : undefined}
                                                    className={erro ? "invalido" : undefined}
                                                    onChange={(e) => alterar(linha.id, c.chave, e.target.value)}
                                                />
                                            )}
                                            {erro && <span className="erro-campo">{erro}</span>}
                                        </td>
                                    );
                                })}
                                <td>
                                    <button
                                        type="button"
                                        className="remover"
                                        aria-label="Remover transição"
                                        onClick={() => remover(linha.id)}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {dica && <p className="dica">{dica}</p>}
        </div>
    );
}
