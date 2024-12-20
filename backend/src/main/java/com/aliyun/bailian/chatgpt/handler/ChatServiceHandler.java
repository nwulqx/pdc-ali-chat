package com.aliyun.bailian.chatgpt.handler;

import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONValidator;
import com.aliyun.bailian.chatgpt.client.BaiLianLlmClient;
import com.aliyun.bailian.chatgpt.dto.CompletionRequestDTO;
import com.aliyun.bailian.chatgpt.dto.CompletionResponseDTO;
import com.aliyun.bailian.chatgpt.dto.Result;
import com.aliyun.bailian.chatgpt.enums.ErrorCodeEnum;
import com.aliyun.bailian.chatgpt.exceptions.BizException;
import com.aliyun.bailian.chatgpt.model.ChatMessage;
import com.aliyun.bailian.chatgpt.service.ChatSessionService;
import com.aliyun.bailian.chatgpt.utils.LogUtils;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;


/**
 * 对话服务处理
 *
 * @author yuanci
 */
@Service
public class ChatServiceHandler {
    private final ChatSessionService chatSessionService;

    private final BaiLianLlmClient llmClient;

    private CompletionRequestDTO request;

    private Long startTime;

    private String responseText;

    private boolean success;

    public ChatServiceHandler(ChatSessionService chatSessionService, BaiLianLlmClient llmClient) {
        this.chatSessionService = chatSessionService;
        this.llmClient = llmClient;
    }

    /**
     * 对话服务处理
     *
     * @param request 对话请求
     * @return 流式结果响应
     */
    public Flux<Result<CompletionResponseDTO>> handle(CompletionRequestDTO request) {
        this.request = request;
        this.startTime = System.currentTimeMillis();

        String sessionId = request.getSessionId();
        /**
         * 这个 sessionId 应该由 chatgpt 维护，不应该交由客户端
         *
         */
        // if (StringUtils.isBlank(sessionId)) {
        // sessionId = UUID.randomUUID().toString();
        // request.setSessionId(sessionId);
        // }

        Deque<ChatMessage> chatMessages = chatSessionService.getChatSessions(sessionId);
        request.setChatMessages(chatMessages);

        Flux<CompletionsResponse> flux = llmClient.createStreamCompletion(request);

        return flux.onBackpressureBuffer()
                .map(this::convertResponse)
                .onErrorResume(this::handleError)
                .doOnComplete(this::handleComplete);
    }

    /**
     * 错误调用处理
     *
     * @param t 异常
     * @return 错误提示
     */
    private Mono<Result<CompletionResponseDTO>> handleError(Throwable t) {
        String requestId = request.getRequestId();
        LogUtils.monitor(requestId, "ChatServiceHandler", "handleError", "error", startTime, request, t);

        Result<CompletionResponseDTO> error = Result.error(requestId, ErrorCodeEnum.CREATE_COMPLETION_ERROR);
        if (t instanceof BizException) {
            BizException e = (BizException) t;
            error = Result.error(requestId, e.getErrorCode(), e.getMessage());
        }

        return Mono.just(error);
    }

    /**
     * 调用完成处理，并保存对话历史
     */
    private void handleComplete() {
        if (!success) {
            return;
        }

        String requestId = request.getRequestId();
        LogUtils.monitor(requestId, "ChatServiceHandler", "handleComplete", null, startTime, request);

        String userMessage = request.getContent();
        if (StringUtils.isNotBlank(userMessage) && StringUtils.isNotBlank(responseText)) {
            ChatMessage message = new ChatMessage();
            message.setUser(userMessage);
            message.setAssistant(responseText);

            String sessionId = request.getSessionId();
            chatSessionService.saveChatMessage(sessionId, message);
        }
    }

    /**
     * 转换响应结果
     *
     * @param response LLM响应结果
     * @return 返回给前端的结果
     */
    private Result<CompletionResponseDTO> convertResponse(CompletionsResponse response) {
        if (response == null) {
            return null;
        }

        String requestId = request.getRequestId();
        String sessionId = response.getData().getSessionId();
        Result<CompletionResponseDTO> result = new Result<>();

        if (!response.isSuccess()) {
            throw new BizException(response.getCode(), response.getMessage());
        }

        success = true;
        if (response.getData() != null) {
            LogUtils.trace(requestId, "ChatServiceHandler", "SUCCESS", startTime, null, response);

            result.setSuccess(true);
            String responseText = response.getData().getText();

            CompletionResponseDTO responseDTO = new CompletionResponseDTO();
            responseDTO.setContentType("text");
            responseDTO.setSessionId(sessionId);
            responseDTO.setContent(responseText);
            result.setData(responseDTO);

            this.responseText = responseText;
        }

        return result;
    }

    private static boolean isValidJson(String text) {
        if (text == null) {
            return false;
        }

        try {
            return JSONValidator.from(text).validate();
        } catch (JSONException e) {
            return false;
        }
    }
}
