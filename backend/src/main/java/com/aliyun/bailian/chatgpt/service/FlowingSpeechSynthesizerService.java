package com.aliyun.bailian.chatgpt.service;

import com.alibaba.nls.client.protocol.NlsClient;
import com.alibaba.nls.client.protocol.OutputFormatEnum;
import com.alibaba.nls.client.protocol.SampleRateEnum;
import com.alibaba.nls.client.protocol.tts.FlowingSpeechSynthesizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FlowingSpeechSynthesizerService {

    @Autowired
    private TokenService tokenService;

    @Value("${aliyun.appKey}")
    private String appKey;


    @Value("${TTSFlowing.speechVoice}")
    private String speechVoice;

    @Value("${TTSFlowing.speechVolume}")
    private int speechVolume;

    @Value("${TTSFlowing.speechPitchRate}")
    private int speechPitchRate;

    @Value("${TTSFlowing.speechRate}")
    private int speechRate;

    @Value("${TTSFlowing.minSendIntervalMS}")
    private int minSendIntervalMS;

    public String synthesize(String content) {
        FlowingSpeechSynthesizer synthesizer = null;
        CustomSpeechSynthesizerListener listener = new CustomSpeechSynthesizerListener();
        try {
            NlsClient nlsClient = tokenService.getNlsClient();
            synthesizer = new FlowingSpeechSynthesizer(nlsClient, listener);
            synthesizer.setAppKey(appKey);
            synthesizer.setFormat(OutputFormatEnum.WAV);
            synthesizer.setSampleRate(SampleRateEnum.SAMPLE_RATE_16K);
            synthesizer.setVoice(speechVoice);
            synthesizer.setVolume(speechVolume); // 朗读音量，范围是0~100，默认50。
            synthesizer.setPitchRate(speechPitchRate); // 朗读语调，范围是-500~500，默认是0。
            synthesizer.setSpeechRate(speechRate); // 朗读语速，范围是-500~500，默认是0。
            synthesizer.setMinSendIntervalMS(minSendIntervalMS);

            listener.prepareForSynthesis();  // 重置监听器

            synthesizer.start();
            synthesizer.send(content);
            synthesizer.stop();

            return listener.getAudioData();  // 获取音频数据

        } catch (Exception e) {
            throw new RuntimeException("TTS Synthesis Failed", e);
        } finally {
            if (synthesizer != null) {
                synthesizer.close();
            }
        }
    }
}
