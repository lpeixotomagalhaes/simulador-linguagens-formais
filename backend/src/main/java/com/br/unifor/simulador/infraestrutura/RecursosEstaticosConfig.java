package com.br.unifor.simulador.infraestrutura;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

/**
 * Cache dos arquivos da interface (build do Vite em static/).
 *
 * O jar guarda todos os arquivos com a mesma data fixa (build reproduzível),
 * então a validação por Last-Modified sempre responderia "não mudou" e o
 * navegador continuaria usando um index.html antigo, que aponta para um .js
 * apagado: a página ficava em branco depois de um novo build. Por isso o
 * index.html vai sem Last-Modified e com no-cache (ver application.properties),
 * e os arquivos de assets/, que têm o hash do conteúdo no nome, podem ficar
 * em cache por um ano.
 */
@Configuration
public class RecursosEstaticosConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());
    }
}
