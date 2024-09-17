package com.aliyun.bailian.chatgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.Setter;

@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class CosyVoiceCloneResponseDTO {

    @JsonProperty("RequestId")
    private String requestId;

    @JsonProperty("Message")
    private String message;

    @JsonProperty("Code")
    private int code;

    @JsonProperty("VoiceName")
    private String voiceName;

}
