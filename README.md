# Simulador de Linguagens Formais e Modelos Computacionais

![Java](https://img.shields.io/badge/Java-25%20LTS-007396)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.2-6DB33F)
![React](https://img.shields.io/badge/React-18.3-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)
![Testes](https://img.shields.io/badge/testes-40%20passando-success)

Aplicação web para **modelar, validar e simular** os modelos da Teoria da Computação: linguagens formais,
autômatos finitos (AFD e AFN), gramáticas livres de contexto, autômatos com pilha e máquinas de Turing. Cada
simulação mostra o processamento **passo a passo**, com o diagrama de estados do modelo, a pilha do AP e a fita
da MT.

Projeto prático em dupla (AV3) da disciplina **Aspectos Teóricos da Computação**, curso de **Ciência da
Computação**, **Universidade de Fortaleza (Unifor)**.

| | |
|---|---|
| **Alunos** | Gabriel Rocha (2410451) · Lucas Peixoto (2310402) |
| **Professor** | Ildo Ramos Vieira |
| **Documento técnico** | [`docs/documento-tecnico/main.pdf`](docs/documento-tecnico/main.pdf) |

---

## Sumário

1. [Funcionalidades](#1-funcionalidades)
2. [Tecnologias](#2-tecnologias)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Como executar](#4-como-executar)
5. [Como usar a interface](#5-como-usar-a-interface)
6. [Testes](#6-testes)
7. [Arquitetura](#7-arquitetura)
8. [Estrutura de pastas](#8-estrutura-de-pastas)
9. [API REST](#9-api-rest)
10. [Exemplos de entrada e saída](#10-exemplos-de-entrada-e-saída)
11. [Análise de complexidade](#11-análise-de-complexidade)
12. [Documento técnico](#12-documento-técnico)
13. [Solução de problemas](#13-solução-de-problemas)
14. [Autores](#14-autores)

---

## 1. Funcionalidades

| # | Módulo | O que faz |
|---|---|---|
| 1 | **Linguagens formais** | Define o alfabeto Σ e uma linguagem L finita; valida se a cadeia pertence a Σ*; calcula o tamanho \|w\|, a concatenação w·v e se w ∈ L; lista Σ* e Σ+ até um tamanho k. |
| 2 | **Autômato finito** | Simula **AFD** e **AFN** (com transições λ e fecho-λ). Mostra o caminho `q0 → q1 → q2` e cada transição. O autômato pode ser montado numa tabela ou **carregado e salvo em JSON**. |
| 3 | **Gramática livre de contexto** | Define V, T, P e S; encontra a **derivação mais à esquerda** da cadeia, passo a passo, e desenha a **árvore de derivação**. |
| 4 | **Autômato com pilha** | Simula APs, inclusive não determinísticos, com aceitação por estado final ou por pilha vazia. A cada passo mostra **leitura, estado e conteúdo da pilha**. |
| 5 | **Máquina de Turing** | Simula MTs determinísticas, com **fita animada**. Traz as duas máquinas do enunciado: reconhecer `w#w` (opção A) e somar dois números em unário (opção B). |

Em todos os módulos:

- **diagrama de estados** desenhado automaticamente e atualizado durante a edição (AF, AP e MT);
- **passo a passo** com botões ◀ ▶ e "Reproduzir", que destaca o estado ativo no diagrama;
- **exemplos prontos** (os do enunciado estão marcados com "PDF");
- **validação** com mensagens explicando o erro (símbolo fora de Σ, AFD não determinístico, produção malformada…);
- **descrição formal** do modelo (por exemplo, `M = (Q, Σ, Γ, δ, q0, qaceita, qrejeita)`).

## 2. Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Java (Eclipse Temurin) | 25 LTS |
| | Spring Boot (Web MVC) | 4.1.2 |
| | Maven (via wrapper `mvnw`, não precisa instalar) | 3.9 |
| | JUnit | 5 |
| Frontend | React | 18.3.1 |
| | Vite | 5.4.11 |
| | Motion (animações) | 12.23.12 |
| | Componentes [React Bits](https://reactbits.dev) | BlurText, CountUp |
| Documento | LaTeX ([Tectonic](https://tectonic-typesetting.github.io) ou Overleaf) | |

## 3. Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| **JDK** | **25** | compilar e rodar o backend |
| **Node.js** | 18 ou superior (testado no 24) | gerar a interface React |
| **Git** | qualquer | clonar o repositório |

### Instalar o JDK 25

Recomendado: **Eclipse Temurin 25** em <https://adoptium.net/temurin/releases/?version=25>.

- **Windows:** baixe o `.msi` (marque a opção que configura o `JAVA_HOME`) ou o `.zip`.
- **Linux:** `sudo apt install temurin-25-jdk` (com o repositório da Adoptium), ou use o [SDKMAN](https://sdkman.io): `sdk install java 25-tem`.
- **macOS:** `brew install --cask temurin@25`.

### Apontar o `JAVA_HOME` para o JDK 25

O `mvnw` usa a variável `JAVA_HOME`. Se você tem mais de um JDK instalado, aponte-a para o 25:

```powershell
# Windows (PowerShell), só para o seu usuário. Feche e abra o terminal depois.
[Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\caminho\para\jdk-25', 'User')
```

```bash
# Linux / macOS (coloque no ~/.bashrc ou ~/.zshrc)
export JAVA_HOME=/caminho/para/jdk-25
export PATH="$JAVA_HOME/bin:$PATH"
```

Para conferir: `./mvnw -v` deve mostrar `Java version: 25...`.

## 4. Como executar

### Opção 1: passo a passo (recomendado)

```bash
# 1. Clonar
git clone https://github.com/lpeixotomagalhaes/simulador-linguagens-formais.git
cd simulador-linguagens-formais

# 2. Gerar a interface (o build vai para src/main/resources/static)
cd frontend
npm install
npm run build
cd ..

# 3. Subir o servidor
./mvnw spring-boot:run          # Windows (cmd): mvnw.cmd spring-boot:run
```

Abra **<http://localhost:8080>**. Para parar o servidor, use `Ctrl + C` no terminal.

> O repositório já traz o build da interface em `src/main/resources/static`. Se você só quer rodar, sem mexer no
> frontend, pode pular o passo 2.

### Opção 2: gerar um `.jar` e executar

```bash
./mvnw clean package
java -jar target/simulador-linguagens-formais-0.0.1-SNAPSHOT.jar
```

O `.jar` contém o backend e a interface; basta ter o Java 25 na máquina onde ele vai rodar.

### Opção 3: modo de desenvolvimento (recarga automática da interface)

Use dois terminais:

```bash
# terminal 1: backend na porta 8080
./mvnw spring-boot:run

# terminal 2: interface na porta 5173, com recarga automática
cd frontend
npm run dev
```

Abra <http://localhost:5173>. O Vite repassa as chamadas `/api` para a porta 8080 (`frontend/vite.config.js`).

### Usar outra porta

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=9090
# ou: java -jar target/simulador-linguagens-formais-0.0.1-SNAPSHOT.jar --server.port=9090
```

## 5. Como usar a interface

1. Escolha o módulo nas abas do topo (1 a 5). A aba aberta fica no endereço (`#af`, `#glc`, `#ap`, `#mt`).
2. Clique em um **exemplo pronto** ou preencha a definição do modelo (alfabeto, estados, transições ou produções).
3. Digite a **cadeia de entrada**. Use `λ` (ou deixe vazio) para a cadeia vazia.
4. Clique em **Executar / Derivar / Reconhecer**.
5. Veja o resultado (**ACEITA**, **REJEITA** ou o erro de configuração) e navegue pelos passos.

Convenções de escrita:

| Símbolo | Como digitar |
|---|---|
| cadeia vazia λ | `λ`, `ε`, `lambda` ou campo vazio |
| alfabeto | `a,b`, `a, b` ou `ab` |
| produções da GLC | uma regra por linha: `S -> aSb \| λ` (`->` ou `→`) |
| empilhar no AP | `AZ` empilha `A` sobre `Z` (o primeiro símbolo fica no topo) |
| branco da MT | `B` (aparece como `⊔`) |
| movimento da MT | `D` (direita) ou `E` (esquerda) |

## 6. Testes

```bash
./mvnw test
```

São **40 testes**, todos passando:

| Classe | Testes | O que verifica |
|---|---|---|
| `AnalisarLinguagemTest` | 6 | Σ = {a,b}, `abba`: válida, tamanho 4; Σ* e Σ+ em ordem canônica; concatenação; w ∈ L |
| `SimularAutomatoFinitoTest` | 7 | `ab` → `q0 → q1 → q2` ACEITA; AFD não determinístico é recusado; AFN por conjuntos; λ-transições |
| `DerivarCadeiaTest` | 6 | `S → aSb \| λ` aceita `aaabbb` e rejeita `aab`; parênteses balanceados; produções inválidas |
| `SimularAutomatoPilhaTest` | 5 | aⁿbⁿ aceita `aabb`, rejeita `aab`, `abb`, `ba` e λ; pilha vazia; não determinismo (wwᴿ) |
| `SimularMaquinaTuringTest` | 12 | soma unária `000100` → `00000`; `w#w` aceita `01#01`, rejeita `01#10`; validações |
| `ArquiteturaTest` | 3 | regra de dependência entre as camadas (veja a seção 7) |
| `SimuladorMaquinaTuringApplicationTests` | 1 | a aplicação Spring sobe |

## 7. Arquitetura

O backend segue a **arquitetura limpa**: o código é dividido em camadas concêntricas, e as dependências só
apontam para dentro.

```
            ┌───────────────────────────────────────────────┐
  HTTP ───▶ │ adaptadores.web   controllers REST            │  Spring
            │ infraestrutura    configuração dos beans      │
            │   ┌───────────────────────────────────────┐   │
            │   │ aplicacao   casos de uso + Validacao  │   │  Java puro
            │   │   ┌───────────────────────────────┐   │   │
            │   │   │ dominio   modelos e algoritmos│   │   │  Java puro
            │   │   └───────────────────────────────┘   │   │
            │   └───────────────────────────────────────┘   │
            └───────────────────────────────────────────────┘
```

- **`dominio`**: os modelos (`Alfabeto`, `AutomatoFinito`, `Gramatica`, `AutomatoPilha`, `MaquinaTuring`, `Fita`)
  e os records de resultado. Não importa nada além de `java.*`.
- **`aplicacao`**: um caso de uso por módulo (`AnalisarLinguagem`, `SimularAutomatoFinito`, `DerivarCadeia`,
  `SimularAutomatoPilha`, `SimularMaquinaTuring`). Valida a entrada e aciona o domínio. Não depende do Spring.
- **`adaptadores.web`**: os controllers REST, que convertem HTTP/JSON em chamada de caso de uso.
- **`infraestrutura`**: `CasosDeUsoConfig`, o único ponto que registra os casos de uso no Spring.

Fluxo de uma simulação: **controller → caso de uso (valida) → modelo do domínio (simula) → record → JSON**.
Uma definição inválida devolve **HTTP 400** com o campo `motivo` explicando o erro.

O teste `ArquiteturaTest` lê os imports de cada camada e falha se alguma depender de uma camada mais externa
(por exemplo, se o domínio importar o Spring).

O **frontend** (React) tem uma tela por módulo em `frontend/src/modulos` e componentes reutilizáveis em
`frontend/src/components`. O principal é o `DiagramaEstados`, que desenha qualquer autômato em SVG.

## 8. Estrutura de pastas

```
simulador-linguagens-formais/
├── docs/documento-tecnico/      documento técnico (LaTeX + PDF + logo)
├── frontend/                    interface React + Vite
│   ├── index.html
│   ├── vite.config.js           build em ../src/main/resources/static e proxy /api
│   └── src/
│       ├── App.jsx              cabeçalho e abas
│       ├── api.js               chamada única aos endpoints
│       ├── exemplos.js          exemplos prontos de cada módulo
│       ├── styles.css           tema claro/escuro e animações
│       ├── components/          DiagramaEstados, ArvoreDerivacao, TabelaTransicoes,
│       │   │                    Comuns (Fita, Pilha, PassoAPasso, CaixaResultado…)
│       │   └── reactbits/       BlurText e CountUp (React Bits)
│       └── modulos/             Linguagens, AutomatoFinito, Gramatica,
│                                AutomatoPilha, MaquinaTuring
├── src/main/java/com/br/unifor/simulador_maquina_turing/
│   ├── SimuladorMaquinaTuringApplication.java
│   ├── dominio/                 comum, linguagem, automato, gramatica, pilha, turing
│   ├── aplicacao/               comum, linguagem, automato, gramatica, pilha, turing
│   ├── adaptadores/web/         um controller por módulo
│   └── infraestrutura/          CasosDeUsoConfig
├── src/main/resources/
│   ├── application.properties
│   └── static/                  build da interface (gerado pelo npm run build)
├── src/test/java/...            testes JUnit (mesma organização em camadas)
├── pom.xml
└── mvnw, mvnw.cmd               Maven wrapper
```

## 9. API REST

Todos os endpoints recebem e devolvem JSON. Respostas: **200** (a simulação rodou e a cadeia foi aceita ou
rejeitada) ou **400** (definição inválida, com o campo `motivo`). O campo `tipo` vale `aceita`, `rejeita` ou
`erro`.

| Método | Endpoint | Módulo |
|---|---|---|
| POST | `/api/linguagem` | Linguagens formais |
| POST | `/api/automato/simular` | Autômato finito |
| POST | `/api/gramatica/derivar` | Gramática livre de contexto |
| POST | `/api/pilha/simular` | Autômato com pilha |
| POST | `/api/turing/simular` | Máquina de Turing (alias: `/api/simular`) |

<details>
<summary><b>POST /api/linguagem</b></summary>

```json
{ "alfabeto": "a,b", "linguagem": "ab, abba", "cadeia": "abba", "cadeia2": "ab", "k": 2 }
```

Resposta (resumida):

```json
{ "tipo": "aceita", "tamanho": 4, "pertenceL": true, "concatenacao": "abbaab",
  "sigmaEstrela": ["λ","a","b","aa","ab","ba","bb"], "sigmaMais": ["a","b","aa","ab","ba","bb"] }
```
</details>

<details>
<summary><b>POST /api/automato/simular</b> (também é o formato de importação/exportação em JSON)</summary>

```json
{
  "tipo": "AFD",
  "alfabeto": "a,b",
  "estadoInicial": "q0",
  "estadosFinais": "q2",
  "cadeia": "ab",
  "transicoes": [
    { "origem": "q0", "simbolo": "a", "destino": "q1" },
    { "origem": "q1", "simbolo": "b", "destino": "q2" }
  ]
}
```

Resposta (resumida):

```json
{ "tipo": "aceita", "modelo": "AFD", "caminho": "q0 → q1 → q2",
  "passos": [ { "numero": 1, "lido": "a", "antes": ["q0"], "depois": ["q1"], "restante": "b" }, "..." ] }
```

Com `"tipo": "AFN"`, o símbolo pode ser `"λ"` e o mesmo par (origem, símbolo) pode ter vários destinos.
</details>

<details>
<summary><b>POST /api/gramatica/derivar</b></summary>

```json
{ "variaveis": "S", "terminais": "a,b", "simboloInicial": "S",
  "producoes": "S -> aSb | λ", "cadeia": "aaabbb" }
```

A resposta traz `derivacao` (lista de formas sentenciais com a produção usada) e `arvore` (nós aninhados).
</details>

<details>
<summary><b>POST /api/pilha/simular</b></summary>

```json
{
  "alfabeto": "a,b", "alfabetoPilha": "A,Z", "estadoInicial": "q0", "simboloPilha": "Z",
  "estadosFinais": "q2", "criterio": "estado", "cadeia": "aabb",
  "transicoes": [
    { "origem": "q0", "le": "a", "desempilha": "Z", "destino": "q0", "empilha": "AZ" },
    { "origem": "q0", "le": "a", "desempilha": "A", "destino": "q0", "empilha": "AA" },
    { "origem": "q0", "le": "b", "desempilha": "A", "destino": "q1", "empilha": "λ" },
    { "origem": "q1", "le": "b", "desempilha": "A", "destino": "q1", "empilha": "λ" },
    { "origem": "q1", "le": "λ", "desempilha": "Z", "destino": "q2", "empilha": "Z" }
  ]
}
```

`criterio` é `"estado"` (estado final) ou `"pilha"` (pilha vazia). A resposta traz os `passos` com estado,
leitura, entrada restante e pilha (topo à esquerda).
</details>

<details>
<summary><b>POST /api/turing/simular</b></summary>

```json
{
  "estadoInicial": "q0", "estadosFinais": "qf", "estadosRejeita": "",
  "alfabeto": "0,1", "cadeia": "000100",
  "transicoes": [
    { "estadoInicial": "q0", "simboloLido": "0", "novoEstado": "q0", "simboloEscrito": "0", "movimento": "D" },
    { "estadoInicial": "q0", "simboloLido": "1", "novoEstado": "q1", "simboloEscrito": "0", "movimento": "D" }
  ]
}
```

A resposta traz `fitaFinal`, `cabecoteFinal`, o `estado` final e os `passos` (fita antes de cada regra).
</details>

Teste rápido pela linha de comando:

```bash
curl -X POST http://localhost:8080/api/linguagem \
     -H "Content-Type: application/json" \
     -d '{"alfabeto":"a,b","cadeia":"abba","k":2}'
```

## 10. Exemplos de entrada e saída

Os exemplos abaixo são os do enunciado e estão prontos na interface (botões "Carregar exemplo").

### Linguagens formais

| Entrada | Saída |
|---|---|
| Σ = `a,b`, w = `abba` | **Cadeia válida para Σ**, tamanho = 4 |
| Σ = `a,b`, w = `abc` | **Cadeia inválida**: "c" não pertence a {a, b} |
| w = `abba`, v = `ab` | w·v = `abbaab`, \|w·v\| = 6 |
| Σ = `a,b`, k = 2 | Σ* = {λ, a, b, aa, ab, ba, bb}; Σ+ = {a, b, aa, ab, ba, bb} |

### Autômato finito

AFD com `q0 –a→ q1` e `q1 –b→ q2`, F = {q2}:

| Entrada | Saída |
|---|---|
| `ab` | `q0 → q1 → q2` · **ACEITA** |
| `aa` | **REJEITA**: não existe transição saindo de q1 com "a" |

AFN "termina em ab": `babab` → `{q0} → {q0} → {q0,q1} → {q0,q2} → {q0,q1} → {q0,q2}` · **ACEITA**.

### Gramática livre de contexto

`S → aSb | λ`:

| Entrada | Saída |
|---|---|
| `aaabbb` | **Aceita**: S ⇒ aSb ⇒ aaSbb ⇒ aaaSbbb ⇒ aaabbb (e a árvore de derivação) |
| `aab` | **Rejeita** |

### Autômato com pilha: L = { aⁿbⁿ \| n ≥ 1 }

Entrada `aabb`:

| Passo | Estado | Leitura | Pilha |
|---|---|---|---|
| 0 | q0 | — | Z |
| 1 | q0 | a | AZ |
| 2 | q0 | a | AAZ |
| 3 | q1 | b | AZ |
| 4 | q1 | b | Z |
| 5 | q2 | λ | Z → **ACEITA** |

`aab`, `abb`, `ba` e λ são rejeitadas.

### Máquina de Turing

| Máquina | Entrada | Saída |
|---|---|---|
| Opção B, soma unária | `000100` (3 + 2) | **Aceita**, fita final `00000`, em 14 passos |
| Opção A, `w#w` | `01#01`, `110#110` | **Aceita** |
| Opção A, `w#w` | `01#10`, `01#011` | **Rejeita** |

## 11. Análise de complexidade

n = \|w\| (tamanho da cadeia). A justificativa de cada linha está na seção 5 do documento técnico.

| Algoritmo | Melhor caso | Caso médio | Pior caso |
|---|---|---|---|
| Validar w ∈ Σ* | Ω(1) | Θ(n) | O(n) |
| Tamanho \|w\| | Θ(1) | Θ(1) | Θ(1) |
| Concatenação w·v | Θ(\|w\|+\|v\|) | Θ(\|w\|+\|v\|) | Θ(\|w\|+\|v\|) |
| Listar Σ* até k | Θ(k\|Σ\|ᵏ) | Θ(k\|Σ\|ᵏ) | Θ(k\|Σ\|ᵏ) |
| AFD | Ω(1) | Θ(n) | O(n) |
| AFN por conjuntos (com fecho-λ) | Ω(n) | Θ(n\|Q\|) | O(n(\|Q\|+\|δ\|)) |
| GLC: busca em largura | Ω(n²) | depende da gramática | O(bᵈ·n), exponencial |
| GLC: CYK (alternativa citada) | Θ(n³\|G\|) | Θ(n³\|G\|) | Θ(n³\|G\|) |
| AP: busca em largura de configurações | Ω(n) | depende do autômato | O(\|Q\|·n·\|Γ\|²ⁿ⁺¹⁰), exponencial |
| MT: soma unária | Θ(n) | Θ(n) | Θ(n), exatamente 2n + 2 passos |
| MT: w#w | Ω(n) | Θ(n²) | O(n²) |

## 12. Documento técnico

O documento técnico fica em [`docs/documento-tecnico/`](docs/documento-tecnico): `main.tex` (fonte),
`logo-unifor.png` e `main.pdf` (já compilado, 13 páginas). Seções: introdução, fundamentação teórica,
arquitetura (camadas, diagrama de classes e casos de uso), implementação (estruturas de dados, algoritmos e
testes), análise de complexidade e conclusão.

Para recompilar:

- **Tectonic** (baixa sozinho os pacotes LaTeX): `tectonic -X compile main.tex` dentro da pasta.
- **Overleaf:** envie `main.tex` e `logo-unifor.png` para um projeto novo.
- **TeX Live / MiKTeX:** `pdflatex main.tex` duas vezes (por causa do sumário).

## 13. Solução de problemas

<details>
<summary><b>"Web server failed to start. Port 8080 was already in use."</b></summary>

Já existe um processo usando a porta 8080 (muitas vezes, outra instância do próprio simulador).

```powershell
# Windows
netstat -ano | findstr :8080        # a última coluna é o PID
taskkill /PID <PID> /F
```

```bash
# Linux / macOS
lsof -i :8080
kill <PID>
```

Ou suba em outra porta (seção 4).
</details>

<details>
<summary><b>A página abre em branco</b></summary>

Recarregue sem cache com **Ctrl + F5** (ou Cmd + Shift + R no macOS). Isso acontece quando o navegador guardou um
`index.html` de um build anterior. O servidor já manda o navegador revalidar a página
(`spring.web.resources.cache.cachecontrol.no-cache=true`), então só deve ocorrer uma vez.

Se continuar em branco, confira se a pasta `src/main/resources/static` tem `index.html` e `assets/`. Se não
tiver, gere a interface com `cd frontend && npm install && npm run build`.
</details>

<details>
<summary><b>"release version 25 not supported" ou "invalid target release: 25"</b></summary>

O Maven está usando um JDK mais antigo. Aponte o `JAVA_HOME` para o JDK 25 (seção 3), abra um terminal novo e
confira com `./mvnw -v`.
</details>

<details>
<summary><b>"./mvnw: Permission denied" (Linux / macOS)</b></summary>

```bash
chmod +x mvnw
```
</details>

<details>
<summary><b>A interface em <code>npm run dev</code> mostra "Não foi possível falar com o servidor"</b></summary>

O modo de desenvolvimento precisa do backend rodando na porta 8080 ao mesmo tempo (seção 4, opção 3).
</details>

<details>
<summary><b>A GLC ou o AP dizem "rejeitada por limite"</b></summary>

As buscas têm teto (200 000 formas sentenciais na GLC, 100 000 configurações no AP) para que a requisição sempre
termine. Gramáticas muito ambíguas ou APs com laços de transições λ podem atingir esse teto.
</details>

## 14. Autores

| Nome | Matrícula |
|---|---|
| Gabriel Rocha | 2410451 |
| Lucas Peixoto | 2310402 |

Professor: **Ildo Ramos Vieira** · Disciplina: **Aspectos Teóricos da Computação** · Curso: **Ciência da
Computação** · **Universidade de Fortaleza (Unifor)**, 2026.
