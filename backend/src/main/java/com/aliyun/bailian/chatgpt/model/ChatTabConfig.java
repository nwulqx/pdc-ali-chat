package com.aliyun.bailian.chatgpt.model;

import lombok.Data;
import lombok.ToString;

/**
 * @author yuanci
 */

@Data
@ToString
public class ChatTabConfig {
    private String title;

    private String type;

    private String code;

    public ChatTabConfig() {
    }

    public ChatTabConfig(String title, String type, String code) {
        this.title = title;
        this.type = type;
        this.code = code;
    }

}
