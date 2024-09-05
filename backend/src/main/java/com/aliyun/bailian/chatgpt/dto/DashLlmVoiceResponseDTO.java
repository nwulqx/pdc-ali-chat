package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class DashLlmVoiceResponseDTO {
    private String content;
    private String sessionId;

    /**
     * content type, default is text
     */
    private String contentType;

    private String requestId;
}