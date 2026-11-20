/*
 * Sons do toca-fitas, sintetizados na hora com a Web Audio API (não há
 * arquivo de áudio): um clique mecânico nas teclas e um zumbido curto de
 * motor a cada passo da fita. O contexto de áudio só nasce no primeiro
 * clique do usuário (regra dos navegadores) e nada toca com o som desligado.
 */
import { somLigado } from "./preferenciaSom.js";

let contexto = null;

function audio() {
    if (!somLigado()) return null;
    try {
        contexto ??= new (window.AudioContext || window.webkitAudioContext)();
        if (contexto.state === "suspended") contexto.resume();
        return contexto;
    } catch {
        return null;
    }
}

function ruido(ctx, segundos) {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * segundos), ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    const fonte = ctx.createBufferSource();
    fonte.buffer = buffer;
    return fonte;
}

/* Clique de tecla: estalo agudo curto e um "toc" grave do mecanismo. */
export function tocarClique() {
    const ctx = audio();
    if (!ctx) return;
    const t = ctx.currentTime;

    const estalo = ruido(ctx, 0.03);
    const filtro = ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = 2400;
    filtro.Q.value = 1.2;
    const ganhoEstalo = ctx.createGain();
    ganhoEstalo.gain.setValueAtTime(0.18, t);
    ganhoEstalo.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    estalo.connect(filtro).connect(ganhoEstalo).connect(ctx.destination);
    estalo.start(t);

    const toc = ctx.createOscillator();
    toc.type = "sine";
    toc.frequency.setValueAtTime(170, t);
    toc.frequency.exponentialRampToValueAtTime(90, t + 0.05);
    const ganhoToc = ctx.createGain();
    ganhoToc.gain.setValueAtTime(0.12, t);
    ganhoToc.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    toc.connect(ganhoToc).connect(ctx.destination);
    toc.start(t);
    toc.stop(t + 0.07);
}

/* Motor: zumbido grave e baixo, do tamanho do deslize da fita. */
export function tocarMotor(duracaoMs) {
    const ctx = audio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = Math.max(0.06, Math.min(0.3, duracaoMs / 1000));

    const zumbido = ctx.createOscillator();
    zumbido.type = "sawtooth";
    zumbido.frequency.setValueAtTime(70, t);
    zumbido.frequency.linearRampToValueAtTime(95, t + dur * 0.4);
    zumbido.frequency.linearRampToValueAtTime(75, t + dur);
    const atrito = ruido(ctx, dur);
    const passaBaixa = ctx.createBiquadFilter();
    passaBaixa.type = "lowpass";
    passaBaixa.frequency.value = 520;

    const ganho = ctx.createGain();
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(0.045, t + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    zumbido.connect(passaBaixa);
    atrito.connect(passaBaixa);
    passaBaixa.connect(ganho).connect(ctx.destination);
    zumbido.start(t);
    atrito.start(t);
    zumbido.stop(t + dur + 0.02);
}
