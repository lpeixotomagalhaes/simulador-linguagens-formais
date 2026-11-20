/*
 * Aba aberta, guardada no endereço (#af, #glc...) para sobreviver a um
 * recarregamento e para o botão "voltar" do navegador funcionar.
 */
import { useCallback, useEffect, useState } from "react";

export default function useAbaDoEndereco(ids, padrao) {
    const ler = useCallback(() => {
        const id = window.location.hash.replace("#", "");
        return ids.includes(id) ? id : padrao;
    }, [ids, padrao]);

    const [aba, setAba] = useState(ler);

    useEffect(() => {
        const aoMudar = () => setAba(ler());
        window.addEventListener("hashchange", aoMudar);
        return () => window.removeEventListener("hashchange", aoMudar);
    }, [ler]);

    const irPara = useCallback((id) => {
        window.location.hash = id;
    }, []);

    return [aba, irPara];
}
