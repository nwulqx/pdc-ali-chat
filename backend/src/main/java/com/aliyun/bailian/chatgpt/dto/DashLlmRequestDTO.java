package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;


@EqualsAndHashCode(callSuper = true)
@Data
public class DashLlmRequestDTO extends RequestBase {
    private String sessionId;
    /**
     * enum：ChatTypeEnum
     * text_chat: text chat
     * doc_chat: doc chat
     */
    private String sessionType;

    private String prompt;

    private String userId;
}
