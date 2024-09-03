package com.aliyun.bailian.chatgpt.service;
import com.alibaba.nls.client.protocol.tts.FlowingSpeechSynthesizerListener;
import com.alibaba.nls.client.protocol.tts.FlowingSpeechSynthesizerResponse;
import lombok.Setter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Base64;
@Setter
public class CustomSpeechSynthesizerListener extends FlowingSpeechSynthesizerListener {
    private ByteArrayOutputStream audioData = new ByteArrayOutputStream();

    @Override
    public void onSynthesisStart(FlowingSpeechSynthesizerResponse response) {
        // 可选择实现的内容
    }

    @Override
    public void onSentenceBegin(FlowingSpeechSynthesizerResponse response) {
        // 可选择实现的内容
    }

    @Override
    public void onSentenceEnd(FlowingSpeechSynthesizerResponse response) {
        // 可选择实现的内容
    }

    @Override
    public void onAudioData(ByteBuffer message) {
        byte[] audioBytes = new byte[message.remaining()];
        message.get(audioBytes);
        try {
            audioData.write(audioBytes);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onSentenceSynthesis(FlowingSpeechSynthesizerResponse response) {
        // 可选择实现的内容
    }

    @Override
    public void onSynthesisComplete(FlowingSpeechSynthesizerResponse response) {
        // 合成完成后，你可以在这里做一些处理，如果需要
    }

    @Override
    public void onFail(FlowingSpeechSynthesizerResponse response) {
        throw new RuntimeException("TTS Synthesis Failed: " + response.getStatusText());
    }

    public String getAudioData() {
        return Base64.getEncoder().encodeToString(audioData.toByteArray());
    }

    public void prepareForSynthesis() {
        audioData.reset(); // 清空之前的数据
    }
}
