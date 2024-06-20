package com.aliyun.bailian.chatgpt.enums;

/**
 * @author yuanci
 */

public enum ErrorCodeEnum {
    /**
     * System error
     */
    SYSTEM_ERROR("10000", "System error"),

    PARAMS_INVALID("10001", "Request param is missing"),

    REQUEST_LLM_TIMEOUT("10100", "Request LLM timout"),

    GUEST_NOT_EXIST("10201", "Guest user does not exist"),

    GET_UPLOAD_POLICY_ERROR("10301", "get upload policy error"),

    IMPORT_DOCUMENT_ERROR("10302", "import document error"),

    QUERY_DOCUMENT_ERROR("10303", "query document error"),

    IMPORT_DOCUMENT_TIMEOUT("10304", "import document timeout"),

    CREATE_COMPLETION_ERROR("10305", "create completion error"),

    CHAT_CONFIG_INVALID("10305", "chat config invalid"),
    ;

    /**
     * error code
     */
    private final String errorCode;

    /**
     * error message
     */
    private final String errorMessage;

    ErrorCodeEnum(String errorCode, String errorMessage) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }


    public String getErrorCode() {
        return this.errorCode;
    }

    public String getErrorMessage() {
        return this.errorMessage;
    }

    public String getErrorMessage(Object... args) {
        return String.format(this.errorMessage, args);
    }

    public static ErrorCodeEnum getErrorCodeEnum(String errorCode) {
        for (ErrorCodeEnum codeConstants : values()) {
            if (codeConstants.errorCode.equals(errorCode)) {
                return codeConstants;
            }
        }

        return SYSTEM_ERROR;
    }
}
