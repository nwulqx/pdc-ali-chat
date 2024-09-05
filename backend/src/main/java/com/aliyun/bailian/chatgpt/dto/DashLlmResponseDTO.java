package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;
import lombok.ToString;
@Data
@ToString
public class DashLlmResponseDTO {
    /**
     * session id for chat history
     */
    private String sessionId;

    /**
     * content type, default is text
     */
    private String contentType;

    /**
     * completion result
     */
    private String content;

    private String requestId;
}