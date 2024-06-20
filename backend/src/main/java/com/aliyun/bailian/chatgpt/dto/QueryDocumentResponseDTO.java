package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author yuanci
 */
@Data
public class QueryDocumentResponseDTO implements Serializable {
    private String dataId;

    private Long dataStatus;
}
