package com.br.unifor.simulador.infraestrutura;

import com.br.unifor.simulador.aplicacao.automato.SimularAutomatoFinito;
import com.br.unifor.simulador.aplicacao.gramatica.DerivarCadeia;
import com.br.unifor.simulador.aplicacao.linguagem.AnalisarLinguagem;
import com.br.unifor.simulador.aplicacao.pilha.SimularAutomatoPilha;
import com.br.unifor.simulador.aplicacao.turing.SimularMaquinaTuring;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registra os casos de uso como beans do Spring.
 *
 * Os casos de uso (camada de aplicação) e os modelos (domínio) não conhecem
 * o Spring: são classes Java comuns, testadas sem subir a aplicação. Esta
 * classe é o único ponto que liga o framework a eles, e os controllers
 * (adaptadores.web) recebem os beans pelo construtor.
 */
@Configuration
public class CasosDeUsoConfig {

    @Bean
    AnalisarLinguagem analisarLinguagem() {
        return new AnalisarLinguagem();
    }

    @Bean
    SimularAutomatoFinito simularAutomatoFinito() {
        return new SimularAutomatoFinito();
    }

    @Bean
    DerivarCadeia derivarCadeia() {
        return new DerivarCadeia();
    }

    @Bean
    SimularAutomatoPilha simularAutomatoPilha() {
        return new SimularAutomatoPilha();
    }

    @Bean
    SimularMaquinaTuring simularMaquinaTuring() {
        return new SimularMaquinaTuring();
    }
}
