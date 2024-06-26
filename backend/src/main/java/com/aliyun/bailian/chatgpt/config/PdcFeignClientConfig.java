package com.aliyun.bailian.chatgpt.config;

public class PdcFeignClientConfig {

    private final String url;

    public PdcFeignClientConfig(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }
}
