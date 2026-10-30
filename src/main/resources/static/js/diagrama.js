const BRANCO = "⊔";
const SIMBOLOS_BRANCO = new Set(["B", "⊔", "□", "⌴"]);
const NS = "http://www.w3.org/2000/svg";

function simboloVisual(simbolo) {
    const texto = (simbolo || "").trim();
    if (SIMBOLOS_BRANCO.has(texto)) {
        return BRANCO;
    }
    return texto;
}

function simboloParaMaquina(simbolo) {
    const texto = (simbolo || "").trim();
    if (SIMBOLOS_BRANCO.has(texto)) {
        return "B";
    }
    return texto;
}

function rotuloTransicao(transicao) {
    const lido = simboloVisual(transicao.simboloLido);
    const escrito = simboloVisual(transicao.simboloEscrito);
    const movimento = transicao.movimento === "E" ? "E" : "D";
    if (lido === escrito) {
        return lido + "→" + movimento;
    }
    return lido + "→" + escrito + "," + movimento;
}

function semRepeticao(lista) {
    const vistos = [];
    lista.forEach((item) => {
        if (!vistos.includes(item)) {
            vistos.push(item);
        }
    });
    return vistos;
}

/*
 * Junta o que está na tela num único objeto, usado pelo desenho e pela
 * descrição formal. A quantidade de estados não fica gravada em lugar nenhum:
 * ela é |Q|, o tamanho da lista `estados` montada aqui.
 * Entram em Q, sem repetir: o estado inicial, os dois lados de cada transição
 * completa e os estados finais (aceita e, se existir, rejeita).
 * Σ sai do campo de alfabeto. Γ começa com Σ e ganha os símbolos extras
 * escritos ou lidos nas transições (por exemplo x). O branco ⊔ é acrescentado
 * só na hora de escrever Γ, porque ele não faz parte de Σ.
 */
function modeloAtual() {
    const inicial = document.querySelector("#estadoInicial").value.trim();
    const classificados = lerEstadosDoQuadro();
    const finais = classificados.aceita;
    const rejeitados = classificados.rejeita;
    const alfabeto = lerAlfabeto(document.querySelector("#alfabeto").value);
    const sigma = alfabeto.erro ? [] : alfabeto.simbolos;
    const transicoes = lerTransicoes().filter((transicao) =>
        PADRAO_ESTADO.test(transicao.estadoInicial.trim())
        && PADRAO_ESTADO.test(transicao.novoEstado.trim())
        && transicao.simboloLido.trim().length === 1
        && transicao.simboloEscrito.trim().length === 1);

    const estados = [];
    const adicionarEstado = (estado) => {
        if (PADRAO_ESTADO.test(estado) && !estados.includes(estado)) {
            estados.push(estado);
        }
    };
    adicionarEstado(inicial);
    transicoes.forEach((transicao) => {
        adicionarEstado(transicao.estadoInicial.trim());
        adicionarEstado(transicao.novoEstado.trim());
    });
    finais.forEach(adicionarEstado);
    rejeitados.forEach(adicionarEstado);

    const gamma = [...sigma];
    transicoes.forEach((transicao) => {
        [transicao.simboloLido, transicao.simboloEscrito].forEach((simbolo) => {
            const visual = simboloVisual(simbolo);
            if (visual !== BRANCO && !gamma.includes(visual)) {
                gamma.push(visual);
            }
        });
    });

    return { inicial, finais, rejeitados, sigma, gamma, estados, transicoes };
}

function svg(nome, atributos) {
    const elemento = document.createElementNS(NS, nome);
    Object.entries(atributos).forEach(([chave, valor]) => elemento.setAttribute(chave, String(valor)));
    return elemento;
}

function posicionar(estados) {
    const quantidade = estados.length;
    const raio = quantidade <= 1 ? 0 : Math.max(150, quantidade * 42);
    const centro = {
        x: raio + 180,
        y: raio * 0.78 + 130
    };
    return {
        centro,
        nos: estados.map((id, indice) => {
            const angulo = Math.PI + (2 * Math.PI * indice) / Math.max(quantidade, 1);
            const rx = Math.max(34, Math.min(64, 18 + id.length * 5.4));
            return {
                id,
                x: centro.x + Math.cos(angulo) * raio,
                y: centro.y + Math.sin(angulo) * raio * 0.78,
                rx,
                ry: 30
            };
        })
    };
}

function pontoNaBorda(no, alvoX, alvoY) {
    const dx = alvoX - no.x;
    const dy = alvoY - no.y;
    const angulo = Math.atan2(dy, dx);
    return {
        x: no.x + Math.cos(angulo) * (no.rx + 2),
        y: no.y + Math.sin(angulo) * (no.ry + 2)
    };
}

function escreverTexto(pai, x, y, linhas) {
    const texto = svg("text", {
        x,
        y: y - ((linhas.length - 1) * 16) / 2,
        "text-anchor": "middle",
        "font-family": "Palatino Linotype, Georgia, Segoe UI Symbol, Segoe UI, sans-serif",
        "font-size": 15,
        fill: "#1d1a16"
    });
    texto.setAttribute("stroke", "#ffffff");
    texto.setAttribute("stroke-width", "5");
    texto.setAttribute("paint-order", "stroke");
    linhas.forEach((linha, indice) => {
        const trecho = svg("tspan", { x, dy: indice === 0 ? 0 : 16 });
        trecho.textContent = linha;
        texto.appendChild(trecho);
    });
    pai.appendChild(texto);
}

function desenharAresta(pai, origem, destino, rotulos, centro) {
    const mesmoEstado = origem.id === destino.id;
    if (mesmoEstado) {
        const dx = origem.x - centro.x;
        const dy = origem.y - centro.y;
        const comprimento = Math.hypot(dx, dy) || 1;
        const ux = dx / comprimento;
        const uy = dy / comprimento;
        const saida = {
            x: origem.x + ux * origem.rx + -uy * 8,
            y: origem.y + uy * origem.ry + ux * 8
        };
        const chegada = {
            x: origem.x + ux * origem.rx - -uy * 8,
            y: origem.y + uy * origem.ry - ux * 8
        };
        const controle = {
            x: origem.x + ux * (origem.rx + 58),
            y: origem.y + uy * (origem.ry + 58)
        };
        const caminho = svg("path", {
            d: `M ${saida.x} ${saida.y} C ${controle.x + -uy * 26} ${controle.y + ux * 26}, ${controle.x - -uy * 26} ${controle.y - ux * 26}, ${chegada.x} ${chegada.y}`,
            fill: "none",
            stroke: "#1d1a16",
            "stroke-width": 1.6,
            "marker-end": "url(#seta)"
        });
        pai.appendChild(caminho);
        escreverTexto(pai, controle.x + ux * 16, controle.y + uy * 16, rotulos);
        return;
    }

    const inicio = pontoNaBorda(origem, destino.x, destino.y);
    const fim = pontoNaBorda(destino, origem.x, origem.y);
    const meioX = (inicio.x + fim.x) / 2;
    const meioY = (inicio.y + fim.y) / 2;
    const paraForaX = meioX - centro.x;
    const paraForaY = meioY - centro.y;
    const distancia = Math.hypot(paraForaX, paraForaY) || 1;
    const controleX = meioX + (paraForaX / distancia) * 54;
    const controleY = meioY + (paraForaY / distancia) * 54;
    const caminho = svg("path", {
        d: `M ${inicio.x} ${inicio.y} Q ${controleX} ${controleY} ${fim.x} ${fim.y}`,
        fill: "none",
        stroke: "#1d1a16",
        "stroke-width": 1.6,
        "marker-end": "url(#seta)"
    });
    pai.appendChild(caminho);
    const rotuloX = (inicio.x + 2 * controleX + fim.x) / 4;
    const rotuloY = (inicio.y + 2 * controleY + fim.y) / 4;
    const empurraX = rotuloX - centro.x;
    const empurraY = rotuloY - centro.y;
    const empurra = Math.hypot(empurraX, empurraY) || 1;
    escreverTexto(pai, rotuloX + (empurraX / empurra) * 14, rotuloY + (empurraY / empurra) * 14, rotulos);
}

/*
 * Desenha o diagrama de estados no elemento #diagrama.
 * Os estados ficam numa elipse (o inicial à esquerda). As setas saem para
 * fora do centro para não atravessar os círculos. Um laço fica do lado de
 * fora do próprio estado. Estado de aceitação ganha um segundo contorno.
 * O rótulo da seta é "lido→movimento" quando o símbolo escrito é o mesmo
 * (0→D) e "lido→escrito,movimento" quando muda (0→x,D). Direita é D,
 * esquerda é E. B, □ e ⌴ aparecem como ⊔.
 */
function desenharDiagrama(modelo) {
    const painel = document.querySelector("#diagrama");
    painel.replaceChildren();
    if (modelo.estados.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "diagrama-vazio";
        vazio.textContent = "Informe o estado inicial ou uma transição para montar o diagrama.";
        painel.appendChild(vazio);
        return;
    }

    const disposicao = posicionar(modelo.estados);
    const nos = disposicao.nos;
    const porId = new Map(nos.map((no) => [no.id, no]));
    const largura = Math.max(...nos.map((no) => no.x + no.rx)) + 90;
    const altura = Math.max(...nos.map((no) => no.y + no.ry)) + 80;
    const desenho = svg("svg", {
        width: largura,
        height: altura,
        viewBox: `0 0 ${largura} ${altura}`,
        role: "img"
    });
    desenho.setAttribute("aria-label", "Diagrama de estados da máquina de Turing");

    const defs = svg("defs", {});
    const marcador = svg("marker", {
        id: "seta",
        viewBox: "0 0 10 10",
        refX: 9,
        refY: 5,
        markerWidth: 8,
        markerHeight: 8,
        orient: "auto"
    });
    marcador.appendChild(svg("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#1d1a16" }));
    defs.appendChild(marcador);
    desenho.appendChild(defs);

    const grupos = new Map();
    modelo.transicoes.forEach((transicao) => {
        const de = transicao.estadoInicial.trim();
        const para = transicao.novoEstado.trim();
        const chave = de + "\u0000" + para;
        if (!grupos.has(chave)) {
            grupos.set(chave, []);
        }
        grupos.get(chave).push(rotuloTransicao(transicao));
    });
    grupos.forEach((rotulos, chave) => {
        const [de, para] = chave.split("\u0000");
        desenharAresta(desenho, porId.get(de), porId.get(para), semRepeticao(rotulos), disposicao.centro);
    });

    nos.forEach((no) => {
        desenho.appendChild(svg("ellipse", {
            cx: no.x,
            cy: no.y,
            rx: no.rx,
            ry: no.ry,
            fill: "#fff",
            stroke: "#1d1a16",
            "stroke-width": 1.7
        }));
        const nome = svg("text", {
            x: no.x,
            y: no.y + 5,
            "text-anchor": "middle",
            "font-family": "Palatino Linotype, Georgia, Segoe UI Symbol, Segoe UI, sans-serif",
            "font-size": 18,
            fill: "#1d1a16"
        });
        nome.textContent = no.id;
        desenho.appendChild(nome);
        if (modelo.finais.includes(no.id)) {
            desenho.appendChild(svg("ellipse", {
                cx: no.x,
                cy: no.y,
                rx: Math.max(18, no.rx - 7),
                ry: Math.max(16, no.ry - 7),
                fill: "none",
                stroke: "#1d1a16",
                "stroke-width": 1.4
            }));
        }
    });

    const inicial = porId.get(modelo.inicial);
    if (inicial) {
        desenho.appendChild(svg("line", {
            x1: inicial.x - inicial.rx - 46,
            y1: inicial.y,
            x2: inicial.x - inicial.rx - 2,
            y2: inicial.y,
            stroke: "#1d1a16",
            "stroke-width": 1.6,
            "marker-end": "url(#seta)"
        }));
    }

    painel.appendChild(desenho);
}

function linhaDescricao(texto) {
    const paragrafo = document.createElement("p");
    paragrafo.textContent = texto;
    return paragrafo;
}

function conjunto(simbolos) {
    return "{" + (simbolos.length ? simbolos.join(", ") : "") + "}";
}

function blocoFormal(simbolo, legenda) {
    const bloco = document.createElement("div");
    bloco.className = "bloco-formal";
    const linha = document.createElement("p");
    linha.className = "simbolo-formal";
    linha.textContent = simbolo;
    const nota = document.createElement("p");
    nota.className = "legenda-formal";
    nota.textContent = legenda;
    bloco.append(linha, nota);
    return bloco;
}

/*
 * Escreve a descrição formal em #descricao, no formato do livro:
 * M = (Q, Σ, Γ, δ, estado inicial, estado de aceitação) e, quando existe
 * um único estado de rejeição, ele entra no fim da tupla.
 * |Q| é só modelo.estados.length, calculado em modeloAtual().
 */
function escreverDescricao(modelo) {
    const painel = document.querySelector("#descricao");
    painel.replaceChildren();
    if (modelo.estados.length === 0) {
        painel.appendChild(linhaDescricao("A descrição formal aparece junto com os estados."));
        return;
    }

    const inicial = modelo.inicial && modelo.estados.includes(modelo.inicial)
        ? modelo.inicial
        : modelo.estados[0];
    const aceitacao = modelo.finais.length === 1 ? modelo.finais[0] : "F";
    const rejeicao = modelo.rejeitados.length === 1 ? modelo.rejeitados[0] : "";
    const tupla = rejeicao
        ? `M = (Q, Σ, Γ, δ, ${inicial}, ${aceitacao}, ${rejeicao})`
        : `M = (Q, Σ, Γ, δ, ${inicial}, ${aceitacao})`;
    painel.appendChild(linhaDescricao(tupla));
    painel.appendChild(blocoFormal(`|Q| = ${modelo.estados.length}`, "quantidade de estados"));
    painel.appendChild(blocoFormal(`Q = ${conjunto(modelo.estados)}`, "conjunto dos estados"));
    painel.appendChild(blocoFormal(`Σ = ${conjunto(modelo.sigma)}`, "alfabeto reconhecido"));
    painel.appendChild(blocoFormal(`Γ = ${conjunto([...modelo.gamma, BRANCO])}`, "alfabeto da fita"));
}

function atualizarDiagrama() {
    const modelo = modeloAtual();
    desenharDiagrama(modelo);
    escreverDescricao(modelo);
}
