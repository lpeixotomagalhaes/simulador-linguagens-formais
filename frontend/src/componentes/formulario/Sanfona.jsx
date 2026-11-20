/*
 * Seção que abre e fecha: altura animada por grid-template-rows 0fr → 1fr e
 * chevron que gira. O conteúdo continua no DOM, então o que foi digitado nele
 * não se perde ao fechar.
 */
import { useId, useState } from "react";

export default function Sanfona({ titulo, children, abertaInicial = false }) {
    const [aberta, setAberta] = useState(abertaInicial);
    const id = useId();
    return (
        <div className={"sanfona" + (aberta ? " aberta" : "")}>
            <button type="button" className="sanfona-botao" aria-expanded={aberta} aria-controls={id} onClick={() => setAberta(!aberta)}>
                <svg className="sanfona-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 6.5l3 3 3-3" /></svg>
                {titulo}
            </button>
            <div className="sanfona-corpo" id={id} inert={aberta ? undefined : ""}>
                <div className="sanfona-conteudo">{children}</div>
            </div>
        </div>
    );
}
