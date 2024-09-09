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
import com.aliyun.bailian.chatgpt.dto.DashLlmResponseDTO;
import com.aliyun.bailian.chatgpt.dto.DashLlmVoiceResponseDTO;
import com.aliyun.bailian.chatgpt.dto.Result;
import io.reactivex.Flowable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.Resource;
import javax.sound.sampled.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class LLmDashClient {

    @Resource
    private LlmDashConfig llmDashConfig; // 注入配置信息
    private final ExecutorService audioExecutor = Executors.newFixedThreadPool(2);

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

        // 使用提取的构建方法来创建 ApplicationParam
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
                audioExecutor.submit(() -> processAndSendSpeechSegment(synthesizer, textSegment, emitter));

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

                // 更新回调中的 requestId 和 sessionId
                callback.setRequestAndSessionId(requestId, responseSessionId);

                // 异步生成语音片段并推送
                audioExecutor.submit(() -> processAndSendSpeechSegment(synthesizer, textSegment, emitter));

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
}
