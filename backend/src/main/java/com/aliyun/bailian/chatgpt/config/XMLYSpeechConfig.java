package com.aliyun.bailian.chatgpt.config;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
@Data
@Configuration
@ConfigurationProperties(prefix = "xmly")
public class XMLYSpeechConfig {
    private String authToken;
    private double rate;
    private double volume;
    private double pitch;
    private String domain;
    private String speakerName;
    private String speakerVariant;
    private int sr;
}