package com.aliyun.bailian.chatgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
public class CosyVoiceListResponseDTO {
    @JsonProperty("TotalCount")
    @Setter
    private int totalCount;

    @JsonProperty("RequestId")
    @Setter
    private String requestId;

    @JsonProperty("Message")
    @Setter
    private String message;

    @JsonProperty("PageSize")
    @Setter
    private int pageSize;

    @JsonProperty("PageIndex")
    @Setter
    private int pageIndex;

    @JsonProperty("Code")
    @Setter
    private int code;

    @JsonProperty("Voices")
    @Setter
    private List<Object> voices; // 可以根据实际情况定义具体的Voice对象

    // 生成getter和setter方法
    // 可以使用lombok简化
}
