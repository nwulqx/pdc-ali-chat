package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author yuanci
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ImportDocumentRequestDTO extends RequestBase {
    public String fileName;

    public Long fileStoreId;

    public String ossPath;

    public Long storeId;

    public String userId;
}
