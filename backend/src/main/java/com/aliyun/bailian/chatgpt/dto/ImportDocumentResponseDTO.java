package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author yuanci
 */
@Data
public class ImportDocumentResponseDTO implements Serializable {
    public String dataId;

    public Long dataStatus;
}
