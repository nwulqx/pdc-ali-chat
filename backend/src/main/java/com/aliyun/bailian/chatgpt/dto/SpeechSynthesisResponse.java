package com.aliyun.bailian.chatgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SpeechSynthesisResponse {
    private boolean success;
    private int code;
    private String message;
    private ResponseData data;
    @JsonProperty("request-uid")
    private String requestUid;

    @Data
    public static class ResponseData {
        @JsonProperty("request_id")
        private String requestId;
    }
}