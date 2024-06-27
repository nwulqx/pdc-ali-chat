package com.aliyun.bailian.chatgpt.config;

import lombok.Data;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * Lvmh LLM config
 *
 * @author yuanci
 */
@Configuration
@ConfigurationProperties(prefix = "chat.llm")
@Data
public class LlmConfig {
    /**
     * access key id of aliyun account
     */
    private String accessKeyId;

    /**
     * access key secret of aliyun account
     */
    private String accessKeySecret;

    /**
     * agent key of bailian business space
     */
    private String agentKey;

    /**
     * appIds
     */
    private Map<String, String> appIds;

    /**
     * request time out of LLM
     */
    private Integer timeout = 60;

    private String popEndpoint;

    private String endpoint;

    private String nlsKey;

    @Getter
    private Integer seed;

    @Getter
    private Integer topK;

    public String getAccessKeyId() {
        String val = System.getenv("ACCESS_KEY_ID");
        if (StringUtils.isNotBlank(val)) {
            return val;
        }

        return accessKeyId;
    }

    public String getAccessKeySecret() {
        String val = System.getenv("ACCESS_KEY_SECRET");
        if (StringUtils.isNotBlank(val)) {
            return val;
        }

        return accessKeySecret;
    }
}
