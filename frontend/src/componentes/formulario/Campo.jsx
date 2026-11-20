/* Campo de texto com rótulo, mensagem de erro e dica. */
export default function Campo({ rotulo, valor, aoMudar, placeholder, erro, dica, largo, mono, ...resto }) {
    return (
        <label className={largo ? "largo" : undefined}>
            {rotulo}
            <input
                value={valor}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck={false}
                className={[erro ? "invalido" : "", mono ? "mono" : ""].join(" ").trim() || undefined}
                aria-invalid={erro ? "true" : undefined}
                onChange={(e) => aoMudar(e.target.value)}
                {...resto}
            />
            {erro && <span className="erro-campo">{erro}</span>}
            {dica && !erro && <span className="dica-campo">{dica}</span>}
        </label>
    );
}
