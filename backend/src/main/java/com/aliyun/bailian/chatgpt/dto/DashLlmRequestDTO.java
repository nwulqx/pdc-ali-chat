package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonProperty;

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
    /**
     * himalaya: 喜马拉雅语音 默认
     * alicloud: 阿里语音
     */
    private String audioSource;

    @JsonProperty("VoiceName")
    private String voiceName;

    private String fileBase64;
}
