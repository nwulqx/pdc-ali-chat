package com.aliyun.bailian.chatgpt.client;

import com.alibaba.dashscope.app.Application;
import com.alibaba.dashscope.app.ApplicationParam;
import com.alibaba.dashscope.app.ApplicationResult;
import com.aliyun.bailian.chatgpt.config.LlmDashConfig;
import com.aliyun.bailian.chatgpt.config.XMLYSpeechConfig;
import com.aliyun.bailian.chatgpt.dto.DashLlmResponseDTO;
import com.aliyun.bailian.chatgpt.dto.DashLlmVoiceResponseDTO;
import com.aliyun.bailian.chatgpt.dto.Result;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisRequest;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisResponse;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisResultDTO;
import com.aliyun.bailian.chatgpt.service.FlowingSpeechSynthesizerService;
import com.aliyun.bailian.chatgpt.service.SpeechSynthesisService;
import io.reactivex.Flowable;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.PreDestroy;
import java.io.IOException;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LLmDashClient {

    @Autowired
    private LlmDashConfig llmDashConfig;

    @Autowired
    private SpeechSynthesisService speechSynthesisService;

    @Autowired
    private XMLYSpeechConfig xmlySpeechConfig;

    @Autowired
    private FlowingSpeechSynthesizerService flowingSpeechSynthesizerService;

    private final ExecutorService textProcessorExecutor = Executors.newSingleThreadExecutor();
    private final ExecutorService resultProcessorExecutor = Executors.newSingleThreadExecutor();
    private final BlockingQueue<SpeechTask> taskQueue = new LinkedBlockingQueue<>();

    private final StringBuilder textBuffer = new StringBuilder();
    private static final Pattern SENTENCE_END_PATTERN = Pattern.compile("[.。!！?？;；]");

    // 提取 ApplicationParam 的构建逻辑，减少重复
    private ApplicationParam buildApplicationParam(String prompt, String sessionId) {
        return ApplicationParam.builder()
                .appId(llmDashConfig.appId())
                .apiKey(llmDashConfig.apikey())
                .prompt(prompt)
                .topK(llmDashConfig.topK())
                .seed(llmDashConfig.seed())
                .incrementalOutput(true)
                .sessionId(sessionId) // 使用 sessionId 维护会话
                .build();
    }

    // 提取 SpeechSynthesisParam 的构建逻辑，减少重复
    // private SpeechSynthesisParam buildSpeechSynthesisParam() {
    // return SpeechSynthesisParam.builder()
    // .apiKey(llmDashConfig.apikey())
    // .model(llmDashConfig.voiceModel())
    // .voice(llmDashConfig.voice())
    // .format(SpeechSynthesisAudioFormat.WAV_22050HZ_MONO_16BIT)
    // .build();
    // }

    // 封装映射数据的方法
    private DashLlmResponseDTO buildResponseDTO(ApplicationResult data) {
        DashLlmResponseDTO responseDTO = new DashLlmResponseDTO();

        // 映射数据到 DashLlmResponseDTO
        String requestId = data.getRequestId();
        String sessionId = data.getOutput().getSessionId();
        String content = data.getOutput().getText();

        // 设置字段
        responseDTO.setRequestId(requestId);
        responseDTO.setSessionId(sessionId);
        responseDTO.setContent(content);
        responseDTO.setContentType("text"); // 默认设置为文本类型，视需求修改

        return responseDTO;
    }

    // 封装文本流 SSE 推送
    public SseEmitter streamText(String prompt, String sessionId) {
        SseEmitter emitter = new SseEmitter();

        // 用提取的构建方法来创建 ApplicationParam
        ApplicationParam param = buildApplicationParam(prompt, sessionId);

        // 异步调用生成文本
        new Thread(() -> {
            try {
                Application application = new Application();
                Flowable<ApplicationResult> resultStream = application.streamCall(param);

                resultStream.blockingForEach(data -> {
                    // 调用封装的方法来构建响应 DTO
                    DashLlmResponseDTO responseDTO = buildResponseDTO(data);
                    // 推送封装好的响应对象给客户端
                    emitter.send(SseEmitter.event().data(Result.success(responseDTO)));
                });
                emitter.complete();
            } catch (Exception e) {
                try {
                    // 推送错误信息给客户端
                    emitter.send(SseEmitter.event().data(Result.error("500", e.getMessage())));
                } catch (IOException ioException) {
                    ioException.printStackTrace();
                }
                // 完成 SSE 并传递异常
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }

    // 封装语音流 SSE 推送
    public SseEmitter streamSpeech(String prompt, String sessionId) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1小时超时
        AtomicBoolean isCompleted = new AtomicBoolean(false);

        ApplicationParam param = buildApplicationParam(prompt, sessionId);

        // 启动文本处理线程
        textProcessorExecutor.submit(() -> {
            try {
                Application application = new Application();
                Flowable<ApplicationResult> resultStream = application.streamCall(param);

                StringBuilder textBuffer = new StringBuilder();
                String[] latestSessionId = { sessionId }; // 使用数组来存储最新的 sessionId

                resultStream.blockingForEach(data -> {
                    String text = data.getOutput().getText();
                    latestSessionId[0] = data.getOutput().getSessionId(); // 更新最新的 sessionId
                    System.out.println("Received text: " + text);
                    if (text.isEmpty()) {
                        // 如果接收到空字符串，表示结束，关闭 SSE
                        emitter.complete();
                        isCompleted.set(true);
                        return;
                    }
                    if (!text.isEmpty()) {
                        textBuffer.append(text);
                        int lastIndex = 0;
                        Matcher matcher = SENTENCE_END_PATTERN.matcher(textBuffer);

                        while (matcher.find()) {
                            String sentence = textBuffer.substring(lastIndex, matcher.end());
                            processSentenceForSpeech(sentence, latestSessionId[0], emitter);
                            lastIndex = matcher.end();
                        }

                        // 移除已处理的文本
                        if (lastIndex > 0) {
                            textBuffer.delete(0, lastIndex);
                        }
                    }
                });

                // 处理可能剩余在缓冲区的文本
                if (textBuffer.length() > 0) {
                    processSentenceForSpeech(textBuffer.toString(), latestSessionId[0], emitter);
                }

                isCompleted.set(true);
            } catch (Exception e) {
                System.err.println("Error in text processing: " + e.getMessage());
                isCompleted.set(true);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private void processSentenceForSpeech(String sentence, String sessionId, SseEmitter emitter) {
        try {
            String audioBase64 = flowingSpeechSynthesizerService.synthesize(sentence);

            DashLlmVoiceResponseDTO responseDTO = new DashLlmVoiceResponseDTO();
            responseDTO.setContent(audioBase64);
            responseDTO.setSessionId(sessionId);
            responseDTO.setContentType("audio");

            emitter.send(SseEmitter.event().data(Result.success(responseDTO)));
            System.out.println("Sent audio result for sentence: " + sentence);
        } catch (Exception e) {
            System.err.println("Error processing sentence for speech: " + e.getMessage());
            try {
                emitter.send(
                        SseEmitter.event().data(Result.error("500", "Error processing speech: " + e.getMessage())));
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }

    // 封装文本+语音流 SSE 推送
    // public SseEmitter streamTextAndSpeech(String prompt, String sessionId) {

    // }

    public SseEmitter streamSpeechWithXMLY(String prompt, String sessionId) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1小时超时
        AtomicBoolean isTextCompleted = new AtomicBoolean(false);
        AtomicBoolean isEmitterClosed = new AtomicBoolean(false);

        ApplicationParam param = buildApplicationParam(prompt, sessionId);

        // 启动结果处理线程
        CompletableFuture<Void> pollResultsFuture = CompletableFuture.runAsync(
                () -> pollResults(emitter, sessionId, isTextCompleted, isEmitterClosed),
                resultProcessorExecutor);

        // 启动文本处理线程
        CompletableFuture<Void> textProcessingFuture = CompletableFuture.runAsync(() -> {
            try {
                Application application = new Application();
                Flowable<ApplicationResult> resultStream = application.streamCall(param);

                String[] latestSessionId = { sessionId };

                resultStream.blockingForEach(data -> {
                    String text = data.getOutput().getText();
                    latestSessionId[0] = data.getOutput().getSessionId();
                    System.out.println("Received text: " + text);
                    if (!text.isEmpty()) {
                        processText(text, latestSessionId[0]);
                    }
                });

                // 处理可能剩余在缓冲区的文本
                if (textBuffer.length() > 0) {
                    processSentence(textBuffer.toString(), latestSessionId[0]);
                    textBuffer.setLength(0);
                }

                isTextCompleted.set(true);
            } catch (Exception e) {
                System.err.println("Error in text processing: " + e.getMessage());
                isTextCompleted.set(true);
                if (!isEmitterClosed.get()) {
                    emitter.completeWithError(e);
                    isEmitterClosed.set(true);
                }
            }
        }, textProcessorExecutor);

        // 等待两个任务都完成
        CompletableFuture.allOf(pollResultsFuture, textProcessingFuture)
                .whenComplete((result, throwable) -> {
                    if (!isEmitterClosed.get()) {
                        try {
                            emitter.complete();
                        } catch (IllegalStateException e) {
                            System.out.println("Emitter already completed");
                        } finally {
                            isEmitterClosed.set(true);
                        }
                    }
                });

        return emitter;
    }

    private void processText(String text, String sessionId) {
        textBuffer.append(text);
        int lastIndex = 0;
        java.util.regex.Matcher matcher = SENTENCE_END_PATTERN.matcher(textBuffer);

        while (matcher.find()) {
            String sentence = textBuffer.substring(lastIndex, matcher.end());
            processSentence(sentence, sessionId);
            lastIndex = matcher.end();
        }

        // 移除已处理的文本
        if (lastIndex > 0) {
            textBuffer.delete(0, lastIndex);
        }
    }

    private void processSentence(String sentence, String sessionId) {
        SpeechSynthesisRequest request = new SpeechSynthesisRequest(sentence, xmlySpeechConfig);
        SpeechSynthesisResponse response = speechSynthesisService.initiateSpeechSynthesis(request);
        if (response.isSuccess() && response.getData() != null) {
            taskQueue.offer(new SpeechTask(response.getData().getRequestId(), sessionId));
        } else {
            System.err.println("Speech synthesis initiation failed: " + response.getMessage());
        }
    }

    private void pollResults(SseEmitter emitter, String sessionId, AtomicBoolean isTextCompleted,
            AtomicBoolean isEmitterClosed) {
        System.out.println("Starting pollResults for sessionId: " + sessionId);
        while (!isTextCompleted.get() || !taskQueue.isEmpty()) {
            if (isEmitterClosed.get()) {
                System.out.println("Emitter closed, stopping pollResults");
                break;
            }
            try {
                SpeechTask task = taskQueue.peek();
                if (task != null) {
                    SpeechSynthesisResultDTO result = speechSynthesisService
                            .fetchSpeechSynthesisResult(task.getRequestId());
                    if (result != null) {
                        if (result.getCode() == 201003) {
                            // 异步合成已完成
                            DashLlmVoiceResponseDTO responseDTO = new DashLlmVoiceResponseDTO();
                            responseDTO.setContent(result.getData().getAudio());
                            responseDTO.setSessionId(task.getSessionId());
                            responseDTO.setContentType("audio");
                            responseDTO.setRequestId(task.getRequestId());

                            try {
                                emitter.send(SseEmitter.event().data(Result.success(responseDTO)));
                                System.out.println("Sent audio result for requestId: " + task.getRequestId());
                                taskQueue.poll();
                            } catch (IllegalStateException e) {
                                System.out.println("SseEmitter已完成，停止发送数据");
                                isEmitterClosed.set(true);
                                break;
                            }
                        } else if (result.getCode() == 201001 || result.getCode() == 201002) {
                            // 异步合成已提交或处理中，继续等待
                            System.out.println("Result not ready, code: " + result.getCode() + " for requestId: "
                                    + task.getRequestId());
                        } else {
                            // 其他错误码，移除任务并记录错误
                            System.err.println("Error in speech synthesis, code: " + result.getCode()
                                    + " for requestId: " + task.getRequestId());
                            taskQueue.poll();
                        }
                    } else {
                        System.out.println("No result for requestId: " + task.getRequestId());
                    }
                }
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.out.println("pollResults interrupted for sessionId: " + sessionId);
                break;
            } catch (Exception e) {
                System.err.println("Error in pollResults for sessionId " + sessionId + ": " + e.getMessage());
                if (e instanceof IllegalStateException) {
                    System.out.println("SseEmitter已完成，停止发送数据");
                    isEmitterClosed.set(true);
                    break;
                }
            }
        }
        System.out.println("pollResults finished for sessionId: " + sessionId);
    }

    private static class SpeechTask {
        @Getter
        private final String requestId;
        @Getter
        private final String sessionId;

        public SpeechTask(String requestId, String sessionId) {
            this.requestId = requestId;
            this.sessionId = sessionId;
        }
    }

    @PreDestroy
    public void destroy() {
        textProcessorExecutor.shutdown();
        resultProcessorExecutor.shutdown();
        try {
            if (!textProcessorExecutor.awaitTermination(800, TimeUnit.MILLISECONDS)) {
                textProcessorExecutor.shutdownNow();
            }
            if (!resultProcessorExecutor.awaitTermination(800, TimeUnit.MILLISECONDS)) {
                resultProcessorExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            textProcessorExecutor.shutdownNow();
            resultProcessorExecutor.shutdownNow();
        }
    }
}
