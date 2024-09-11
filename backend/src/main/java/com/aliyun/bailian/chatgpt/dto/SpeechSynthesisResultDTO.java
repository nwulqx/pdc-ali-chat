package com.aliyun.bailian.chatgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SpeechSynthesisResultDTO {
    private boolean success;
    private int code;
    private String message;
    private ResponseData data;
    @JsonProperty("request-uid")
    private String requestUid;

    @Data
    public static class ResponseData {
        private String audio;
        private String subtitle;
        @JsonProperty("upload_id")
        private String uploadId;
        private int filesize;
        private double duration;
        private String custom;
    }
}