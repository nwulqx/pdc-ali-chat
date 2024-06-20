package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author yuanci
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class UploadPolicyRequestDTO extends RequestBase {
    private String userId;

    private String fileName;

    private Long fileStoreId;
}
