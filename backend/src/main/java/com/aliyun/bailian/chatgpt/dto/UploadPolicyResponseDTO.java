package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author yuanci
 */
@Data
public class UploadPolicyResponseDTO implements Serializable {
    private static final long serialVersionUID = -7341037925814575906L;

    private String accessId;

    private String policy;

    private String signature;

    private String securityToken;

    private String dir;

    private String host;

    private String expire;

    private String key;
}
