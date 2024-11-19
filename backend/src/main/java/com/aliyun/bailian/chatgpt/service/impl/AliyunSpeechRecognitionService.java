package com.aliyun.bailian.chatgpt.service.impl;

import com.alibaba.nls.client.protocol.InputFormatEnum;
import com.alibaba.nls.client.protocol.NlsClient;
import com.alibaba.nls.client.protocol.SampleRateEnum;
import com.alibaba.nls.client.protocol.asr.SpeechRecognizer;
import com.alibaba.nls.client.protocol.asr.SpeechRecognizerListener;
import com.alibaba.nls.client.protocol.asr.SpeechRecognizerResponse;
import com.aliyun.bailian.chatgpt.service.SpeechRecognitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class AliyunSpeechRecognitionService implements SpeechRecognitionService {

    @Autowired
    private TokenService tokenService;

    @Value("${aliyun.appKey}")
    private String appKey;

    @Override
    public String recognizeSpeech(MultipartFile file) throws Exception {
        String tempFileName = UUID.randomUUID().toString() + ".wav";
        File tempFile = new File(tempFileName);
        try (InputStream is = file.getInputStream(); FileOutputStream fos = new FileOutputStream(tempFile)) {
            byte[] buffer = new byte[1024];
            int read;
            while ((read = is.read(buffer)) != -1) {
                fos.write(buffer, 0, read);
            }
        }

        CompletableFuture<String> resultFuture = new CompletableFuture<>();

        SpeechRecognizer recognizer = null;
        try {
            NlsClient nlsClient =  tokenService.getNlsClient();
            recognizer = new SpeechRecognizer(nlsClient, getRecognizerListener(resultFuture));
            recognizer.setAppKey(appKey);
            recognizer.setFormat(InputFormatEnum.PCM);
            recognizer.setSampleRate(SampleRateEnum.SAMPLE_RATE_16K);
            recognizer.setEnableIntermediateResult(true);

            recognizer.start();

            byte[] buffer = new byte[3200];
            try (FileInputStream fis = new FileInputStream(tempFile)) {
                int len;
                while ((len = fis.read(buffer)) > 0) {
                    recognizer.send(buffer, len);
                    Thread.sleep(100); // simulate real-time streaming
                }
            }

            recognizer.stop();

            // 等待识别结果
            return resultFuture.get();
        } finally {
            if (recognizer != null) {
                recognizer.close();
            }
            tempFile.delete();
        }
    }

    private SpeechRecognizerListener getRecognizerListener(CompletableFuture<String> resultFuture) {
        return new SpeechRecognizerListener() {
            @Override
            public void onRecognitionResultChanged(SpeechRecognizerResponse response) {
                // Handle intermediate result
            }

            @Override
            public void onRecognitionCompleted(SpeechRecognizerResponse response) {
                resultFuture.complete(response.getRecognizedText());
            }

            @Override
            public void onStarted(SpeechRecognizerResponse response) {
                // Handle started event
            }

            @Override
            public void onFail(SpeechRecognizerResponse response) {
                resultFuture.completeExceptionally(new RuntimeException(response.getStatusText()));
            }
        };
    }
}
