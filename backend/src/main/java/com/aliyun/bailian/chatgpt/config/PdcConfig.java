package com.aliyun.bailian.chatgpt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PdcConfig {

    @Value("${pdc.tts}")
    private String pdcTtsUrl;

    @Bean
    public PdcFeignClientConfig pdcFeignClientConfig() {
        return new PdcFeignClientConfig(pdcTtsUrl);
    }

    public String getPdcTtsUrl() {
        return pdcTtsUrl;
    }
}
