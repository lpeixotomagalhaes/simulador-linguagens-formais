/* Fita: cadeia em células, com o cabeçote destacado. Usada pela MT e pela leitura do AF e do AP. */
import { LAMBDA } from "../../utilitarios/simbolos.js";

export default function Fita({ simbolos, cabecote, consumidos }) {
    return (
        <div className="fita" role="list">
            {simbolos.map((s, i) => {
                const classes = ["celula"];
                if (i === cabecote) classes.push("atual");
                if (consumidos !== undefined && i < consumidos) classes.push("lida");
                return (
                    <span key={i} className={classes.join(" ")} role="listitem">
                        {s}
                    </span>
                );
            })}
            {simbolos.length === 0 && <span className="celula vazia">{LAMBDA}</span>}
        </div>
    );
}
