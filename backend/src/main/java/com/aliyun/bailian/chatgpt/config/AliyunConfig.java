package com.aliyun.bailian.chatgpt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.alibaba.nls.client.protocol.NlsClient;
import com.aliyun.bailian.chatgpt.service.TokenService;

@Configuration
public class AliyunConfig {

    @Value("${aliyun.appKey}")
    private String appKey;

    @Value("${chat.llm.accessKeyId}")
    private String accessKeyId;

    @Value("${chat.llm.accessKeySecret}")
    private String accessKeySecret;

    @Value("${aliyun.url}")
    private String url;

    @Bean
    public NlsClient nlsClient(TokenService tokenService) {
        return new NlsClient(url.isEmpty() ? tokenService.getToken() : url, tokenService.getToken());
    }

    @Bean
    public String appKey() {
        return appKey;
    }

    @Bean
    public String accessKeyId() {
        return accessKeyId;
    }

    @Bean
    public String accessKeySecret() {
        return accessKeySecret;
    }

}
