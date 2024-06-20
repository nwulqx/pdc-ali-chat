package com.aliyun.bailian.chatgpt.enums;

import java.util.Arrays;
import java.util.Optional;

/**
 * @author yuanci
 */

public enum ImportDocStatusEnum {
    /**
     * 导入成功
     */
    SUCCESS(90L),

    /**
     * 导入中
     */
    IMPORTING(40L),

    /**
     * 导入失败
     */
    FAIL(41L);

    private final Long status;

    ImportDocStatusEnum(Long status) {
        this.status = status;
    }

    public Long getStatus() {
        return this.status;
    }

    public static ImportDocStatusEnum typeOf(Long status) {
        if (status == null) {
            return IMPORTING;
        }

        Optional<ImportDocStatusEnum> any = Arrays.stream(values())
                .filter(importDocStatusEnum -> status.equals(importDocStatusEnum.getStatus()))
                .findAny();

        return any.orElse(IMPORTING);
    }
}
