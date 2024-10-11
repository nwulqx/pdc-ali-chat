package com.aliyun.bailian.chatgpt.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "xmly")
public class XMLYSpeechConfig {
    @Setter
    @Getter
    private String authToken;
    @Setter
    @Getter
    private double rate;
    @Setter
    @Getter
    private double volume;
    @Setter
    @Getter
    private double pitch;
    @Setter
    @Getter
    private String domain;
    @Setter
    @Getter
    private String speakerName;
    @Setter
    @Getter
    private String speakerVariant;
    @Setter
    @Getter
    private int sr;
}