package com.aliyun.bailian.chatgpt.service;

import com.alibaba.nls.client.protocol.NlsClient;
import com.alibaba.nls.client.protocol.OutputFormatEnum;
import com.alibaba.nls.client.protocol.SampleRateEnum;
import com.alibaba.nls.client.protocol.tts.SpeechSynthesizer;
import com.alibaba.nls.client.protocol.tts.SpeechSynthesizerListener;
import com.alibaba.nls.client.protocol.tts.SpeechSynthesizerResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

@Service
public class TtsService {

    @Autowired
    private NlsClient nlsClient;

    @Value("${aliyun.appKey}")
    private String appKey;

    private SpeechSynthesizerListener getSynthesizerListener(final ByteArrayOutputStream out) {
        return new SpeechSynthesizerListener() {
            @Override
            public void onComplete(SpeechSynthesizerResponse response) {
                // handle onComplete
            }

            @Override
            public void onMessage(ByteBuffer message) {
                byte[] bytesArray = new byte[message.remaining()];
                message.get(bytesArray, 0, bytesArray.length);
                try {
                    out.write(bytesArray);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onFail(SpeechSynthesizerResponse response) {
                // handle onFail
            }
        };
    }

    public byte[] synthesize(String text) {
        List<String> textArr = splitLongText(text, 100);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        SpeechSynthesizer synthesizer = null;

        try {
            synthesizer = new SpeechSynthesizer(nlsClient, getSynthesizerListener(out));
            synthesizer.setAppKey(appKey);
            synthesizer.setFormat(OutputFormatEnum.PCM);
            synthesizer.setSampleRate(SampleRateEnum.SAMPLE_RATE_16K);

            for (String part : textArr) {
                synthesizer.setText(part);
                synthesizer.start();
                synthesizer.waitForComplete();
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (synthesizer != null) {
                synthesizer.close();
            }
        }
        return out.toByteArray();
    }

    private List<String> splitLongText(String text, int size) {
        String[] texts = text.split("[、，。；？！,!\\?]");
        StringBuilder textPart = new StringBuilder();
        List<String> result = new ArrayList<>();
        int len = 0;

        for (String s : texts) {
            if (textPart.length() + s.length() + 1 > size) {
                result.add(textPart.toString());
                textPart.delete(0, textPart.length());
            }
            textPart.append(s);
            len += s.length();
            if (len < text.length()) {
                textPart.append(text.charAt(len));
                len++;
            }
        }
        if (textPart.length() > 0) {
            result.add(textPart.toString());
        }
        return result;
    }
}
