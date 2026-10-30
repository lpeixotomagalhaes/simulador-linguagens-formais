const PADRAO_ESTADO = /^[A-Za-z][A-Za-z0-9_]*$/;
const corpo = document.querySelector("#transicoes");
const formulario = document.querySelector("#formulario");
const botaoAdicionar = document.querySelector("#adicionar");
const botaoReconhecer = document.querySelector("#reconhecer");
const resultado = document.querySelector("#resultado");
const status = document.querySelector("#status");
const motivo = document.querySelector("#motivo");
const fitaBloco = document.querySelector("#fita-bloco");
const fita = document.querySelector("#fita");
const passosBloco = document.querySelector("#passos-bloco");
const passos = document.querySelector("#passos");

function criarLinha() {
    const linha = document.createElement("tr");

    [
        ["estadoInicial", "ex.: q0", "Estado atual"],
        ["simboloLido", "ex.: 0", "Símbolo lido"],
        ["novoEstado", "ex.: q1", "Novo estado"],
        ["simboloEscrito", "ex.: 0", "Símbolo escrito"]
    ].forEach(([classe, placeholder, rotulo]) => {
        const celula = document.createElement("td");
        celula.dataset.label = rotulo;
        const campo = document.createElement("input");
        campo.type = "text";
        campo.className = classe;
        campo.placeholder = placeholder;
        campo.autocomplete = "off";
        if (classe.startsWith("simbolo")) {
            campo.maxLength = 1;
            campo.addEventListener("input", () => {
                validarSimboloCampo(campo, papelDoSimbolo(classe));
                validarTransicoesDeterministicas();
                atualizarDiagrama();
            });
        } else {
            const papel = classe === "estadoInicial" ? "o estado atual da transição" : "o novo estado";
            campo.addEventListener("input", () => {
                validarEstado(campo, papel);
                validarTransicoesDeterministicas();
                atualizarDiagrama();
            });
        }
        celula.appendChild(campo);
        celula.appendChild(criarMensagemErro());
        linha.appendChild(celula);
    });

    const celulaMovimento = document.createElement("td");
    celulaMovimento.dataset.label = "Movimento";
    const movimento = document.createElement("select");
    movimento.className = "movimento";
    movimento.innerHTML = `
        <option value="D">Direita</option>
        <option value="E">Esquerda</option>
    `;
    movimento.addEventListener("change", atualizarDiagrama);
    celulaMovimento.appendChild(movimento);
    linha.appendChild(celulaMovimento);

    const celulaRemover = document.createElement("td");
    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "remover";
    remover.setAttribute("aria-label", "Remover transição");
    remover.textContent = "×";
    remover.addEventListener("click", () => {
        linha.remove();
        atualizarDiagrama();
    });
    celulaRemover.appendChild(remover);
    linha.appendChild(celulaRemover);

    return linha;
}

function adicionarLinha(focar) {
    const linha = criarLinha();
    corpo.appendChild(linha);
    if (focar) {
        linha.querySelector("input").focus();
    }
}

function criarMensagemErro() {
    const erro = document.createElement("span");
    erro.className = "erro-campo";
    erro.hidden = true;
    return erro;
}

function limparErro(campo) {
    campo.classList.remove("invalido");
    campo.removeAttribute("aria-invalid");
    const erro = campo.parentElement.querySelector(":scope > .erro-campo");
    if (erro) {
        erro.hidden = true;
        erro.textContent = "";
    }
}

function marcarErro(campo, mensagem) {
    campo.classList.add("invalido");
    campo.setAttribute("aria-invalid", "true");
    let erro = campo.parentElement.querySelector(":scope > .erro-campo");
    if (!erro) {
        erro = criarMensagemErro();
        campo.parentElement.appendChild(erro);
    }
    erro.hidden = false;
    erro.textContent = mensagem;
}

let configuracaoConfirmada = false;

/*
 * Lê o alfabeto reconhecido (Σ) digitado no campo #alfabeto.
 * Cada símbolo é um único caractere. A separação aceita:
 *   - vírgula: 0,1
 *   - ponto e vírgula: 0;1
 *   - vírgula cheia chinesa, que alguns teclados inserem no lugar da vírgula
 *   - símbolos colados, sem separador: 01 vira {0, 1}
 * Espaços são removidos antes da leitura, então "0, 1" também vale.
 * B, ⊔, □ e ⌴ são o branco da fita e são recusados aqui. O branco entra
 * sozinho no alfabeto da fita (Γ), não no alfabeto da cadeia.
 */
function lerAlfabeto(texto) {
    const bruto = (texto || "").trim().replace(/[，；;]/g, ",").replace(/\s+/g, "");
    if (!bruto) {
        return { erro: "Informe o alfabeto. Exemplo: 0,1", simbolos: [] };
    }

    const tokens = /[,;\s]/.test(bruto)
        ? bruto.split(/[,;\s]+/).filter(Boolean)
        : [...bruto];
    if (tokens.length === 0) {
        return { erro: "Informe o alfabeto. Exemplo: 0,1", simbolos: [] };
    }

    const simbolos = [];
    for (const token of tokens) {
        if (token.length !== 1) {
            return {
                erro: `Cada símbolo do alfabeto deve ter um caractere. "${token}" não vale. Exemplo: 0,1`,
                simbolos: []
            };
        }
        if (SIMBOLOS_BRANCO.has(token)) {
            return { erro: "O branco da fita (B ou ⊔) não faz parte do alfabeto reconhecido.", simbolos: [] };
        }
        if (simbolos.includes(token)) {
            return { erro: `O símbolo "${token}" está repetido no alfabeto.`, simbolos: [] };
        }
        simbolos.push(token);
    }
    return { erro: null, simbolos };
}

function textoAlfabeto(simbolos) {
    return simbolos.join(", ");
}

function validarAlfabetoCampo() {
    const campo = document.querySelector("#alfabeto");
    const lido = lerAlfabeto(campo.value);
    if (lido.erro) {
        marcarErro(campo, lido.erro);
        return null;
    }
    limparErro(campo);
    return lido.simbolos;
}

function validarEstado(campo, papel) {
    const valor = campo.value.trim();
    if (!valor) {
        marcarErro(campo, `Informe ${papel}.`);
        return false;
    }
    if (!PADRAO_ESTADO.test(valor)) {
        marcarErro(campo, `O valor "${valor}" não serve para ${papel}. Use uma letra seguida de letras, números ou _. Exemplo: q0.`);
        return false;
    }
    limparErro(campo);
    return true;
}

/*
 * Monta a linha de um estado final. O nome vem preenchido e pode ser editado.
 * O papel (Aceita ou Rejeita) fica fixo: no par, qaceita aceita e qrejeita
 * rejeita; no modo de um estado só, qfinal aceita.
 */
function criarFinal(nome, tipo) {
    const linha = document.createElement("div");
    linha.className = "final-linha";

    const campo = document.createElement("input");
    campo.className = "nome-final";
    campo.value = nome;
    campo.placeholder = nome;
    campo.autocomplete = "off";
    campo.addEventListener("input", () => {
        validarEstadosFinais();
        if (configuracaoConfirmada) {
            atualizarDiagrama();
        }
    });

    const tipoCampo = document.createElement("select");
    tipoCampo.className = "tipo-final";
    tipoCampo.innerHTML = `
        <option value="aceita">Aceita</option>
        <option value="rejeita">Rejeita</option>
    `;
    tipoCampo.value = tipo;
    tipoCampo.disabled = true;

    linha.append(campo, tipoCampo, criarMensagemErro());
    document.querySelector("#lista-finais").appendChild(linha);
}

/*
 * Há só duas formas, escolhidas no quadro de configuração:
 *   par   -> qaceita (Aceita) e qrejeita (Rejeita), os dois já escritos
 *   unico -> somente qfinal (Aceita), também já escrito
 * Trocar o modo reescreve os nomes padrão. O usuário ainda pode alterá-los.
 */
function montarFinais(modo) {
    document.querySelector("#lista-finais").replaceChildren();
    if (modo === "unico") {
        criarFinal("qfinal", "aceita");
        return;
    }
    criarFinal("qaceita", "aceita");
    criarFinal("qrejeita", "rejeita");
}

function lerEstadosDoQuadro() {
    const aceita = [];
    const rejeita = [];
    document.querySelectorAll("#lista-finais .final-linha").forEach((linha) => {
        const nome = linha.querySelector(".nome-final").value.trim();
        if (!PADRAO_ESTADO.test(nome)) {
            return;
        }
        const destino = linha.querySelector(".tipo-final").value === "rejeita" ? rejeita : aceita;
        if (!destino.includes(nome) && !aceita.includes(nome) && !rejeita.includes(nome)) {
            destino.push(nome);
        }
    });
    return { aceita, rejeita };
}

function validarEstadosFinais() {
    const linhas = [...document.querySelectorAll("#lista-finais .final-linha")];
    const aviso = document.querySelector("#erro-finais");
    let ok = true;
    let aceitas = 0;
    const nomes = [];

    linhas.forEach((linha) => {
        const campo = linha.querySelector(".nome-final");
        const nome = campo.value.trim();
        if (!validarEstado(campo, "o estado final")) {
            ok = false;
            return;
        }
        if (nomes.includes(nome)) {
            marcarErro(campo, `O estado ${nome} já foi informado.`);
            ok = false;
            return;
        }
        nomes.push(nome);
        if (linha.querySelector(".tipo-final").value === "aceita") {
            aceitas += 1;
        }
    });

    if (ok && aceitas === 0) {
        aviso.hidden = false;
        aviso.textContent = "Marque ao menos um estado final como Aceita. Exemplo: qaceita.";
        return false;
    }
    aviso.hidden = true;
    aviso.textContent = "";
    return ok;
}

function atualizarResumoAlfabeto() {
    const resumo = document.querySelector("#resumo-alfabeto");
    const simbolos = validarAlfabetoCampo();
    if (!simbolos) {
        resumo.textContent = "Separe os símbolos por vírgula, como 0,1. O B do branco não entra aqui.";
        return null;
    }
    resumo.textContent = `Σ = {${simbolos.join(", ")}}. O branco ⊔ já faz parte da fita e não precisa ser incluído.`;
    return simbolos;
}

function validarCadeiaCampo(simbolos) {
    const campo = document.querySelector("#cadeia");
    if (!simbolos) {
        limparErro(campo);
        return false;
    }
    const fora = [...campo.value].find((simbolo) => simbolo.length !== 1 || !simbolos.includes(simbolo));
    if (fora) {
        marcarErro(campo, `A cadeia contém o símbolo "${fora}", que não pertence ao alfabeto ${textoAlfabeto(simbolos)}.`);
        return false;
    }
    limparErro(campo);
    return true;
}

function papelDoSimbolo(classe) {
    return classe === "simboloLido" ? "o símbolo lido" : "o símbolo escrito";
}

function validarSimboloCampo(campo, papel) {
    const valor = campo.value.trim();
    if (!valor) {
        marcarErro(campo, `Informe ${papel}.`);
        return false;
    }
    if (valor.length !== 1) {
        marcarErro(campo, `${papel} deve ter exatamente um caractere.`);
        return false;
    }
    limparErro(campo);
    return true;
}

let avisoTransicao = null;

function validarTransicoesDeterministicas() {
    avisoTransicao = null;
    const linhas = [...corpo.querySelectorAll("tr")];
    linhas.forEach((linha) => {
        const campo = linha.querySelector(".simboloLido");
        const erro = campo.parentElement.querySelector(":scope > .erro-campo");
        if (erro && !erro.hidden && erro.textContent.includes("duas transições")) {
            limparErro(campo);
        }
    });

    const grupos = new Map();
    linhas.forEach((linha) => {
        const estado = linha.querySelector(".estadoInicial").value.trim();
        const lido = simboloParaMaquina(linha.querySelector(".simboloLido").value.trim());
        const novo = linha.querySelector(".novoEstado").value.trim();
        if (!PADRAO_ESTADO.test(estado) || lido.length !== 1 || !PADRAO_ESTADO.test(novo)) {
            return;
        }
        const chave = estado + "\0" + lido;
        if (!grupos.has(chave)) {
            grupos.set(chave, []);
        }
        grupos.get(chave).push({ linha, estado, lido, novo });
    });

    grupos.forEach((itens) => {
        if (itens.length < 2) {
            return;
        }
        const destinos = [];
        itens.forEach((item) => {
            if (!destinos.includes(item.novo)) {
                destinos.push(item.novo);
            }
        });
        const simbolo = simboloVisual(itens[0].lido);
        avisoTransicao = `No estado ${itens[0].estado} há duas transições lendo o símbolo ${simbolo}: uma vai para ${destinos[0]} e outra para ${destinos[1] || destinos[0]}. Numa máquina de Turing determinística, cada estado tem no máximo uma transição para cada símbolo lido.`;
        itens.forEach((item) => marcarErro(item.linha.querySelector(".simboloLido"), avisoTransicao));
    });
    return avisoTransicao === null;
}

function validarTudo() {
    const estadoOk = validarEstado(document.querySelector("#estadoInicial"), "o estado inicial");
    const finaisOk = validarEstadosFinais();
    const simbolos = validarAlfabetoCampo();
    const cadeiaOk = validarCadeiaCampo(simbolos);
    const linhas = [...corpo.querySelectorAll("tr")];
    let transicoesOk = linhas.length > 0;

    linhas.forEach((linha) => {
        const estadoInicialOk = validarEstado(linha.querySelector(".estadoInicial"), "o estado atual da transição");
        const lidoOk = validarSimboloCampo(linha.querySelector(".simboloLido"), "o símbolo lido");
        const novoOk = validarEstado(linha.querySelector(".novoEstado"), "o novo estado");
        const escritoOk = validarSimboloCampo(linha.querySelector(".simboloEscrito"), "o símbolo escrito");
        transicoesOk = estadoInicialOk && lidoOk && novoOk && escritoOk && transicoesOk;
    });

    const deterministica = validarTransicoesDeterministicas();
    return estadoOk && finaisOk && Boolean(simbolos) && cadeiaOk && transicoesOk && deterministica;
}

function lerTransicoes() {
    return [...corpo.querySelectorAll("tr")].map((linha) => ({
        estadoInicial: linha.querySelector(".estadoInicial").value,
        simboloLido: linha.querySelector(".simboloLido").value,
        novoEstado: linha.querySelector(".novoEstado").value,
        simboloEscrito: linha.querySelector(".simboloEscrito").value,
        movimento: linha.querySelector(".movimento").value
    }));
}

function nomeMovimento(movimento) {
    if (movimento === "E" || movimento === "L") {
        return "esquerda";
    }
    return "direita";
}

function desenharFita(texto, cabecote) {
    fita.replaceChildren();
    [...texto].forEach((simbolo, indice) => {
        const celula = document.createElement("span");
        celula.className = "celula" + (indice === cabecote ? " atual" : "");
        celula.textContent = simboloVisual(simbolo);
        fita.appendChild(celula);
    });
}

function mostrar(dados) {
    const tipo = dados.tipo || "erro";
    resultado.className = "resultado " + tipo;

    if (tipo === "aceita") {
        status.textContent = "Aceita";
    } else if (tipo === "rejeita") {
        status.textContent = "Rejeita";
    } else {
        status.textContent = "Configuração incompleta";
    }

    motivo.textContent = dados.motivo || "Não foi possível reconhecer a cadeia.";

    const temFita = tipo !== "erro" && dados.fitaFinal;
    fitaBloco.hidden = !temFita;
    if (temFita) {
        desenharFita(dados.fitaFinal, dados.cabecoteFinal);
    }

    const lista = dados.passos || [];
    passos.replaceChildren();
    passosBloco.hidden = lista.length === 0;
    lista.forEach((passo) => {
        const item = document.createElement("li");
        item.textContent = `No estado ${passo.estado}, leu ${simboloVisual(passo.simboloLido)}, escreveu ${simboloVisual(passo.simboloEscrito)}, foi para ${passo.novoEstado} e moveu o cabeçote para a ${nomeMovimento(passo.movimento)}.`;
        passos.appendChild(item);
    });

    resultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function reconhecer() {
    if (!validarTudo()) {
        const semTransicao = corpo.querySelectorAll("tr").length === 0;
        mostrar({
            tipo: "erro",
            motivo: avisoTransicao
                || (semTransicao
                    ? "Adicione ao menos uma transição no quadro do autômato."
                    : "Corrija os campos marcados. A cadeia precisa pertencer ao alfabeto reconhecido.")
        });
        return;
    }

    botaoReconhecer.disabled = true;
    botaoReconhecer.textContent = "Reconhecendo...";

    const payload = {
        estadoInicial: document.querySelector("#estadoInicial").value,
        estadosFinais: lerEstadosDoQuadro().aceita.join(","),
        estadosRejeita: lerEstadosDoQuadro().rejeita.join(","),
        alfabeto: document.querySelector("#alfabeto").value,
        cadeia: document.querySelector("#cadeia").value,
        transicoes: lerTransicoes().map((transicao) => ({
            ...transicao,
            simboloLido: simboloParaMaquina(transicao.simboloLido),
            simboloEscrito: simboloParaMaquina(transicao.simboloEscrito)
        }))
    };

    try {
        const resposta = await fetch("/api/simular", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        let dados;
        try {
            dados = await resposta.json();
        } catch (erro) {
            dados = { tipo: "erro", motivo: "O servidor não devolveu um resultado legível." };
        }
        mostrar(dados);
    } catch (erro) {
        mostrar({
            tipo: "erro",
            motivo: "Não foi possível falar com o servidor. Confira se a aplicação está no ar."
        });
    } finally {
        botaoReconhecer.disabled = false;
        botaoReconhecer.textContent = "Reconhecer cadeia";
    }
}

function mostrarEtapas() {
    document.querySelector("#quadro-transicoes").hidden = false;
    document.querySelector("#quadro-diagrama").hidden = false;
    document.querySelector("#resultado").hidden = false;
    if (corpo.querySelectorAll("tr").length === 0) {
        adicionarLinha(false);
    }
    atualizarDiagrama();
    document.querySelector("#quadro-transicoes").scrollIntoView({ behavior: "smooth", block: "start" });
}

function confirmarConfiguracao() {
    const simbolos = atualizarResumoAlfabeto();
    const estadoOk = validarEstado(document.querySelector("#estadoInicial"), "o estado inicial");
    const finaisOk = validarEstadosFinais();
    if (!simbolos || !estadoOk || !finaisOk) {
        return;
    }
    configuracaoConfirmada = true;
    document.querySelector("#confirmar").textContent = "Configuração confirmada";
    mostrarEtapas();
}

document.querySelector("#alfabeto").addEventListener("input", () => {
    const simbolos = atualizarResumoAlfabeto();
    if (document.querySelector("#cadeia").value) {
        validarCadeiaCampo(simbolos);
    }
    if (configuracaoConfirmada) {
        atualizarDiagrama();
    }
});
document.querySelector("#estadoInicial").addEventListener("input", (evento) => {
    validarEstado(evento.target, "o estado inicial");
    if (configuracaoConfirmada) {
        atualizarDiagrama();
    }
});
document.querySelector("#cadeia").addEventListener("input", () => {
    validarCadeiaCampo(validarAlfabetoCampo());
});
document.querySelectorAll('input[name="modo-finais"]').forEach((opcao) => {
    opcao.addEventListener("change", () => {
        if (!opcao.checked) {
            return;
        }
        montarFinais(opcao.value);
        if (configuracaoConfirmada) {
            atualizarDiagrama();
        }
    });
});
document.querySelector("#confirmar").addEventListener("click", confirmarConfiguracao);

botaoAdicionar.addEventListener("click", () => adicionarLinha(true));
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!configuracaoConfirmada) {
        confirmarConfiguracao();
        return;
    }
    reconhecer();
});

montarFinais("par");
atualizarResumoAlfabeto();
