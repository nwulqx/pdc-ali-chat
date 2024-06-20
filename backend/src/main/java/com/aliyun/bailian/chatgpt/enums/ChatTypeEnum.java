package com.aliyun.bailian.chatgpt.enums;

import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;
import java.util.Optional;

/**
 * session type enum
 *
 * @author yuanci
 */
public enum ChatTypeEnum {
    /**
     * 文本问答
     */
    TEXT_CHAT("text_chat"),

    /**
     * 文档问答
     */
    DOC_CHAT("doc_chat");

    private final String type;

    ChatTypeEnum(String type) {
        this.type = type;
    }

    public String getType() {
        return this.type;
    }

    public static ChatTypeEnum typeOf(String type) {
        if (StringUtils.isBlank(type)) {
            return TEXT_CHAT;
        }

        Optional<ChatTypeEnum> any = Arrays.stream(values())
                .filter(docReferenceTypeEnum -> type.equals(docReferenceTypeEnum.getType()))
                .findAny();

        return any.orElse(TEXT_CHAT);
    }
}
