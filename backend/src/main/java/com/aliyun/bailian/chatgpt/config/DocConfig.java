package com.aliyun.bailian.chatgpt.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @author yuanci
 */
@Configuration
@ConfigurationProperties(prefix = "chat.doc")
@Data
public class DocConfig {
    private Long fileStoreId;

    private Long storeId;

    /**
     * request timeout for import doc
     */
    private Integer timeout = 60;
}