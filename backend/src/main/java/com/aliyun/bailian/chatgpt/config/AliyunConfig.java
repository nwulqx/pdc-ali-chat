package com.aliyun.bailian.chatgpt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.alibaba.nls.client.protocol.NlsClient;

@Configuration
public class AliyunConfig {

    @Value("${aliyun.appKey}")
    private String appKey;

    @Value("${aliyun.token}")
    private String token;

    @Value("${aliyun.url}")
    private String url;

    @Bean
    public NlsClient nlsClient() {
        return new NlsClient(url.isEmpty() ? token : url, token);
    }

    @Bean
    public String appKey() {
        return appKey;
    }
}
