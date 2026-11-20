package com.br.unifor.simulador;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Regra de dependência da arquitetura limpa: as dependências só apontam para
 * dentro. adaptadores e infraestrutura -> aplicacao -> dominio.
 *
 * O teste lê os imports de cada arquivo de src/main/java, sem bibliotecas
 * extras, e falha listando cada import que quebra a regra.
 */
class ArquiteturaTest {

    private static final String BASE = "com.br.unifor.simulador";
    private static final Path FONTES = Path.of("src", "main", "java", "com", "br", "unifor", "simulador");
    private static final Pattern IMPORT = Pattern.compile("^import\\s+(?:static\\s+)?([\\w.]+)\\s*;", Pattern.MULTILINE);

    @Test
    void dominioNaoDependeDeNenhumaOutraCamadaNemDeFramework() throws IOException {
        List<String> violacoes = importsQue("dominio", imp ->
                !(imp.startsWith("java.") || imp.startsWith(BASE + ".dominio.")));
        assertTrue(violacoes.isEmpty(), "O domínio só pode usar java.* e o próprio domínio:\n" + String.join("\n", violacoes));
    }

    @Test
    void aplicacaoNaoConheceWebInfraestruturaNemSpring() throws IOException {
        List<String> violacoes = importsQue("aplicacao", imp ->
                imp.startsWith(BASE + ".adaptadores.")
                        || imp.startsWith(BASE + ".infraestrutura.")
                        || imp.startsWith("org.springframework."));
        assertTrue(violacoes.isEmpty(), "A aplicação só pode usar o domínio e java.*:\n" + String.join("\n", violacoes));
    }

    @Test
    void adaptadoresNaoDependemDaInfraestrutura() throws IOException {
        List<String> violacoes = importsQue("adaptadores", imp -> imp.startsWith(BASE + ".infraestrutura."));
        assertTrue(violacoes.isEmpty(), "Os adaptadores não podem usar a infraestrutura:\n" + String.join("\n", violacoes));
    }

    private interface Regra {
        boolean proibe(String importado);
    }

    private static List<String> importsQue(String camada, Regra regra) throws IOException {
        Path pasta = FONTES.resolve(camada);
        assertTrue(Files.isDirectory(pasta), "A camada " + camada + " não existe em " + pasta);
        List<String> violacoes = new ArrayList<>();
        try (Stream<Path> arquivos = Files.walk(pasta)) {
            for (Path arquivo : arquivos.filter(p -> p.toString().endsWith(".java")).toList()) {
                Matcher m = IMPORT.matcher(Files.readString(arquivo));
                while (m.find()) {
                    if (regra.proibe(m.group(1))) {
                        violacoes.add(FONTES.relativize(arquivo) + " importa " + m.group(1));
                    }
                }
            }
        }
        return violacoes;
    }
}
