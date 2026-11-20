/* Liga e desliga o som da troca de aba. */
export default function BotaoSom({ ligado, aoAlternar }) {
    return (
        <button
            type="button"
            className="botao-som"
            onClick={aoAlternar}
            aria-pressed={ligado}
            title={ligado ? "Desligar o som da troca de aba" : "Ligar o som da troca de aba"}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
                {ligado
                    ? <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" className="som-ondas" />
                    : <path d="M16 9.5l5 5M21 9.5l-5 5" className="som-ondas" />}
            </svg>
            <span className="sr-only">{ligado ? "Som ligado" : "Som desligado"}</span>
        </button>
    );
}
