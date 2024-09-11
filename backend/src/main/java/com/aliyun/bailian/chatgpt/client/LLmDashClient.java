package com.aliyun.bailian.chatgpt.client;

import com.alibaba.dashscope.app.Application;
import com.alibaba.dashscope.app.ApplicationParam;
import com.alibaba.dashscope.app.ApplicationResult;
import com.alibaba.dashscope.audio.ttsv2.SpeechSynthesisParam;
import com.alibaba.dashscope.audio.ttsv2.SpeechSynthesizer;
import com.alibaba.dashscope.audio.tts.SpeechSynthesisResult;
import com.alibaba.dashscope.common.ResultCallback;
import com.alibaba.dashscope.audio.ttsv2.SpeechSynthesisAudioFormat;
import com.aliyun.bailian.chatgpt.config.LlmDashConfig;
import com.aliyun.bailian.chatgpt.config.XMLYSpeechConfig;
import com.aliyun.bailian.chatgpt.dto.DashLlmResponseDTO;
import com.aliyun.bailian.chatgpt.dto.DashLlmVoiceResponseDTO;
import com.aliyun.bailian.chatgpt.dto.Result;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisRequest;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisResponse;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisResultDTO;
import com.aliyun.bailian.chatgpt.service.SpeechSynthesisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.reactivex.Flowable;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.PreDestroy;
import javax.sound.sampled.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;

@Component
public class LLmDashClient {

    @Autowired
    private LlmDashConfig llmDashConfig;

    @Autowired
    private SpeechSynthesisService speechSynthesisService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private XMLYSpeechConfig xmlySpeechConfig;

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
    private SpeechSynthesisParam buildSpeechSynthesisParam() {
        return SpeechSynthesisParam.builder()
                .apiKey(llmDashConfig.apikey())
                .model(llmDashConfig.voiceModel())
                .voice(llmDashConfig.voice())
                .format(SpeechSynthesisAudioFormat.WAV_22050HZ_MONO_16BIT)
                .build();
    }

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

        ApplicationParam param = buildApplicationParam(prompt, sessionId);

        SpeechSynthesisParam speechParam = buildSpeechSynthesisParam();
        ReactCallback callback = new ReactCallback(emitter, sessionId);
        SpeechSynthesizer synthesizer = new SpeechSynthesizer(speechParam, callback);

        try {
            Application application = new Application();
            Flowable<ApplicationResult> resultStream = application.streamCall(param);

            // 处理每个生成的文本段
            resultStream.subscribe(data -> {
                String textSegment = data.getOutput().getText();
                String requestId = data.getRequestId(); // 获取 requestId
                String responseSessionId = data.getOutput().getSessionId(); // 获取 requestId
                callback.setRequestAndSessionId(requestId, responseSessionId);

                // 生成对应的语音片段并推送到客户端
                textProcessorExecutor.submit(() -> processAndSendSpeechSegment(synthesizer, textSegment, emitter));

            }, e -> {
                // 处理错误
                handleSseError(emitter, (Exception) e);
            }, () -> {
                synthesizer.streamingComplete();
                emitter.complete();
            });

        } catch (Exception e) {
            handleSseError(emitter, e);
        }

        return emitter;
    }

    // 处理每个文本片段并推送生成的语音片段
    private void processAndSendSpeechSegment(SpeechSynthesizer synthesizer, String textSegment, SseEmitter emitter) {
        try {
            synthesizer.streamingCall(textSegment); // 合成音频片段
        } catch (Exception e) {
            handleSseError(emitter, e);
        }
    }

    // 处理 SSE 错误推送
    private void handleSseError(SseEmitter emitter, Exception e) {
        try {
            emitter.send(SseEmitter.event().data(Result.error("500", "Task failed: " + e.getMessage())));
        } catch (IOException ioException) {
            ioException.printStackTrace();
        }
        emitter.completeWithError(e);
    }

    // ReactCallback 负责推送语音片段
    private static class ReactCallback extends ResultCallback<SpeechSynthesisResult> {
        private final SseEmitter emitter;
        private String sessionId;
        private String requestId;
        private boolean isFirstAudio = true; // 标记是否为第一个音频片段

        // 设置当前的 requestId 和 sessionId
        public void setRequestAndSessionId(String requestId, String sessionId) {
            this.requestId = requestId;
            this.sessionId = sessionId;
        }

        public ReactCallback(SseEmitter emitter, String sessionId) {
            this.emitter = emitter;
            this.sessionId = sessionId;
        }

        // 添加 WAV 头
        private byte[] addWavHeader(byte[] audioData) throws Exception {
            // 定义 WAV 格式
            AudioFormat format = new AudioFormat(22050, 16, 1, true, false);

            // 将音频数据封装为 AudioInputStream
            ByteArrayInputStream bais = new ByteArrayInputStream(audioData);
            AudioInputStream ais = new AudioInputStream(bais, format, audioData.length / format.getFrameSize());

            // 创建输出流用于存储添加了头部的信息
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // 使用 AudioSystem.write 将头部和音频数据写入输出流
            AudioSystem.write(ais, AudioFileFormat.Type.WAVE, baos);

            // 返回完整的音频数据（带头）
            return baos.toByteArray();
        }

        @Override
        public void onEvent(SpeechSynthesisResult result) {
            if (result.getAudioFrame() != null) {
                try {
                    byte[] audioFrame = result.getAudioFrame().array();

                    // 如果是第一个片段，直接使用；否则添加WAV头部
                    byte[] completeAudioFrame;
                    if (isFirstAudio) {
                        completeAudioFrame = audioFrame; // 第一个片段不需要添加头
                        isFirstAudio = false;
                    } else {
                        completeAudioFrame = addWavHeader(audioFrame); // 为后续片段添加WAV头
                    }

                    // 将正常音频片段转换为Base64
                    String audioBase64 = Base64.getEncoder().encodeToString(completeAudioFrame);

                    // 创建返回的音频响应对象
                    DashLlmVoiceResponseDTO voiceResponseDTO = new DashLlmVoiceResponseDTO();
                    voiceResponseDTO.setContent(audioBase64);
                    voiceResponseDTO.setSessionId(this.sessionId);
                    voiceResponseDTO.setRequestId(this.requestId);
                    voiceResponseDTO.setContentType("audio");

                    // 发送正常音频片段
                    emitter.send(SseEmitter.event().data(Result.success(voiceResponseDTO)));
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            }
        }

        @Override
        public void onComplete() {
            isFirstAudio = true;
            emitter.complete();
        }

        @Override
        public void onError(Exception e) {
            isFirstAudio = true;
            emitter.completeWithError(e);
        }
    }

    // 封装文本+语音流 SSE 推送
    public SseEmitter streamTextAndSpeech(String prompt, String sessionId) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1小时超时

        ApplicationParam param = buildApplicationParam(prompt, sessionId);

        // 构建语音合成器参数
        SpeechSynthesisParam speechParam = buildSpeechSynthesisParam();
        ReactCallback callback = new ReactCallback(emitter, sessionId);
        SpeechSynthesizer synthesizer = new SpeechSynthesizer(speechParam, callback);

        try {
            Application application = new Application();
            Flowable<ApplicationResult> resultStream = application.streamCall(param);

            // 处理每个生成的文本段
            resultStream.subscribe(data -> {
                String textSegment = data.getOutput().getText();
                String requestId = data.getRequestId();
                String responseSessionId = data.getOutput().getSessionId();

                // 推送文本响应
                DashLlmResponseDTO responseDTO = buildResponseDTO(data);
                responseDTO.setContentType("text");
                emitter.send(SseEmitter.event().data(Result.success(responseDTO)));

                // 更回调中的 requestId 和 sessionId
                callback.setRequestAndSessionId(requestId, responseSessionId);

                // 异步生成语音片段并推送
                textProcessorExecutor.submit(() -> processAndSendSpeechSegment(synthesizer, textSegment, emitter));

            }, e -> {
                // 处理错误
                handleSseError(emitter, (Exception) e);
            }, () -> {
                synthesizer.streamingComplete();
                emitter.complete();
            });

        } catch (Exception e) {
            handleSseError(emitter, e);
        }

        return emitter;
    }

    public SseEmitter streamSpeechWithXMLY(String prompt, String sessionId, String speechModel) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1小时超时
        AtomicBoolean isCompleted = new AtomicBoolean(false);

        ApplicationParam param = buildApplicationParam(prompt, sessionId);

        // 启动结果处理线程
        resultProcessorExecutor.submit(() -> pollResults(emitter, sessionId, isCompleted));

        // 启动文本处理线程
        textProcessorExecutor.submit(() -> {
            try {
                Application application = new Application();
                Flowable<ApplicationResult> resultStream = application.streamCall(param);

                resultStream.blockingForEach(data -> {
                    String text = data.getOutput().getText();
                    System.out.println("Received text: " + text);
                    if (!text.isEmpty()) {
                        processText(text, sessionId, speechModel);
                    }
                });

                // 处理可能剩余在缓冲区的文本
                if (textBuffer.length() > 0) {
                    processSentence(textBuffer.toString(), sessionId, speechModel);
                    textBuffer.setLength(0);
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

    private void processText(String text, String sessionId, String speechModel) {
        textBuffer.append(text);
        int lastIndex = 0;
        java.util.regex.Matcher matcher = SENTENCE_END_PATTERN.matcher(textBuffer);

        while (matcher.find()) {
            String sentence = textBuffer.substring(lastIndex, matcher.end());
            processSentence(sentence, sessionId, speechModel);
            lastIndex = matcher.end();
        }

        // 移除已处理的文本
        if (lastIndex > 0) {
            textBuffer.delete(0, lastIndex);
        }
    }

    private void processSentence(String sentence, String sessionId, String speechModel) {
        SpeechSynthesisRequest request = createSpeechRequest(sentence, speechModel);
        SpeechSynthesisResponse response = speechSynthesisService.initiateSpeechSynthesis(request);
        if (response.isSuccess() && response.getData() != null) {
            taskQueue.offer(new SpeechTask(response.getData().getRequestId(), sessionId));
        } else {
            System.err.println("Speech synthesis initiation failed: " + response.getMessage());
        }
    }

    private void pollResults(SseEmitter emitter, String sessionId, AtomicBoolean isCompleted) {
        System.out.println("Starting pollResults for sessionId: " + sessionId);
        while (!isCompleted.get() || !taskQueue.isEmpty()) {
            try {
                SpeechTask task = taskQueue.peek(); // 只查看队列头部元素,不移除
                if (task != null) {
                    SpeechSynthesisResultDTO result = speechSynthesisService.fetchSpeechSynthesisResult(task.getRequestId());
                    if (result != null) {
                        if (result.getCode() == 201003) {
                            DashLlmVoiceResponseDTO responseDTO = new DashLlmVoiceResponseDTO();
                            responseDTO.setContent(result.getData().getAudio());
                            responseDTO.setSessionId(task.getSessionId());
                            responseDTO.setContentType("audio");
                            responseDTO.setRequestId(task.getRequestId());

                            emitter.send(SseEmitter.event().data(Result.success(responseDTO)));
                            System.out.println("Sent audio result for requestId: " + task.getRequestId());

                            taskQueue.poll(); // 只有在成功处理后才移除任务
                        } else {
                            System.out.println("Result not ready, code: " + result.getCode() + " for requestId: "
                                    + task.getRequestId());
                            // 结果未准备好,不做任何操作,保持任务在队列中
                        }
                    } else {
                        System.out.println("No result for requestId: " + task.getRequestId());
                        // 没有结果,不做任何操作,保持任务在队列中
                    }
                }
                Thread.sleep(1000); // 每1000ms检查一次
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.out.println("pollResults interrupted for sessionId: " + sessionId);
                break;
            } catch (Exception e) {
                System.err.println("Error in pollResults for sessionId " + sessionId + ": " + e.getMessage());
            }
        }
        System.out.println("pollResults finished for sessionId: " + sessionId);
        emitter.complete();
    }

    private SpeechSynthesisRequest createSpeechRequest(String text, String speechModel) {
        return new SpeechSynthesisRequest(text, xmlySpeechConfig);
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
