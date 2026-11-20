/* Número de resultado que rola até o valor (CountUp do React Bits, modo "roll"). */
import CountUp from "../externos/CountUp.jsx";

export default function Numero({ valor }) {
    if (typeof valor !== "number" || Number.isNaN(valor)) {
        return <>{valor ?? "—"}</>;
    }
    return <CountUp key={valor} to={valor} mode="roll" duration={0.9} trigger="load" />;
}
