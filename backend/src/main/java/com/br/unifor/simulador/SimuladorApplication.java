package com.br.unifor.simulador;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Sobe o servidor da aplicação web.
 *
 * No programa do professor, o main desta classe montava uma única máquina e
 * rodava no console. A cadeia e as transições estavam escritas no próprio
 * Java, não num arquivo de regras separado. Era mais ou menos isto, para a
 * cadeia 000100, que apaga o último 0:
 *
 *   MaquinaTuring mt = new MaquinaTuring("q0", "qf", new Fita("000100"));
 *   mt.adicionarTransicao(new Transicao("q0", '0', "q0", '0', 'D'));
 *   mt.adicionarTransicao(new Transicao("q0", '1', "q1", '1', 'D'));
 *   mt.adicionarTransicao(new Transicao("q1", '0', "q1", '0', 'D'));
 *   mt.adicionarTransicao(new Transicao("q1", 'B', "q2", 'B', 'L'));
 *   mt.adicionarTransicao(new Transicao("q2", '0', "q3", 'B', 'D'));
 *   mt.adicionarTransicao(new Transicao("q3", 'B', "qf", 'B', 'D'));
 *   mt.executar();
 *
 * Para reconhecer outra linguagem era preciso apagar essas linhas, escrever
 * outras e compilar de novo. executar() imprimia o passo a passo no terminal.
 *
 * Agora o main só inicia o Spring Boot (a página em http://localhost:8080).
 * Alfabeto, estados, transições e cadeia vêm do formulário. O navegador
 * envia esse formulário para POST /api/simular. O SimularMaquinaTuring valida
 * os campos e chama o mesmo adicionarTransicao e o mesmo executar() da
 * máquina do professor, uma vez para cada linha que o usuário cadastrou.
 */
@SpringBootApplication
public class SimuladorApplication {

	public static void main(String[] args) {
		SpringApplication.run(SimuladorApplication.class, args);
	}

}
