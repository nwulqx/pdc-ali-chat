package com.aliyun.bailian.chatgpt.controller;

import com.aliyun.bailian.chatgpt.client.LLmDashClient;
import com.aliyun.bailian.chatgpt.dto.DashLlmRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class LlmDashSseController {

    @Autowired
    private LLmDashClient llmDashClient;

    // 提供文本流 SSE 服务
    @PostMapping("/v1/stream-text")
    public SseEmitter streamText(@RequestBody DashLlmRequestDTO request) {
        String prompt = request.getPrompt();
        String sessionId = request.getSessionId();
        return llmDashClient.streamText(prompt, sessionId);
    }

    // 提供语音流 SSE 服务
    @PostMapping("/v1/stream-speech")
    public SseEmitter streamSpeech(@RequestBody DashLlmRequestDTO request) {
        String prompt = request.getPrompt();
        String sessionId = request.getSessionId();
        return llmDashClient.streamSpeechWithXMLY(prompt, sessionId, "");
    }

    // 提供文本+语音流 SSE 服务
    @PostMapping("/v1/stream-text-and-speech")
    public SseEmitter streamTextAndSpeech(@RequestBody DashLlmRequestDTO request) {
        String prompt = request.getPrompt();
        String sessionId = request.getSessionId();
        return llmDashClient.streamTextAndSpeech(prompt, sessionId);
    }
}