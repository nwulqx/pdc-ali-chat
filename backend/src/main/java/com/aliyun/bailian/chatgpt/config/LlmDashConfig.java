package com.aliyun.bailian.chatgpt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LlmDashConfig {
    @Value("${dash.llm.model}")
    private String llmModel;

    @Value("${dash.llm.appId}")
    private String appId;

    @Value("${dash.llm.apikey}")
    private String apikey;

    @Value("${dash.llm.seed}")
    private Integer seed;

    @Value("${dash.llm.topK}")
    private Integer topK;

    @Value("${dash.voice.model}")
    private String voiceModel;

    @Value("${dash.voice.voice}")
    private String voice;

    @Bean
    public String appId() {
        return appId;
    }
    @Bean
    public String llmModel() {
        return llmModel;
    }
    @Bean
    public String apikey() {
        return apikey;
    }

    @Bean
    public Integer seed() {
        return seed;
    }

    @Bean
    public Integer topK() {
        return topK;
    }
    @Bean
    public String voiceModel() {
        return voiceModel;
    }

    @Bean
    public String voice() {
        return voice;
    }

}
