package com.aliyun.bailian.chatgpt.service;

import com.alibaba.nls.client.protocol.InputFormatEnum;
import com.alibaba.nls.client.protocol.NlsClient;
import com.alibaba.nls.client.protocol.SampleRateEnum;
import com.alibaba.nls.client.protocol.asr.SpeechRecognizer;
import com.alibaba.nls.client.protocol.asr.SpeechRecognizerListener;
import com.alibaba.nls.client.protocol.asr.SpeechRecognizerResponse;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class SpeechRecognitionService {

    private static final String APP_KEY = "242HzDFWvNCJJxAl";
    private static final String TOKEN = "0e7dc222d7d440aaa7bb10f5f0c01d30";
    private static final String URL = "wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1";
    private NlsClient client;

    public SpeechRecognitionService() {
        client = new NlsClient(URL, TOKEN);
    }

    public String recognize(InputStream inputStream) throws Exception {
        SpeechRecognizer recognizer = null;
        StringBuilder result = new StringBuilder();
        try {
            SpeechRecognizerListener listener = new SpeechRecognizerListener() {
                @Override
                public void onRecognitionResultChanged(SpeechRecognizerResponse response) {
                    result.append(response.getRecognizedText());
                }

                @Override
                public void onRecognitionCompleted(SpeechRecognizerResponse response) {
                    result.append(response.getRecognizedText());
                }

                @Override
                public void onStarted(SpeechRecognizerResponse response) {
                    System.out.println("Recognition started");
                }

                @Override
                public void onFail(SpeechRecognizerResponse response) {
                    result.append("Recognition failed: ").append(response.getStatusText());
                }
            };

            recognizer = new SpeechRecognizer(client, listener);
            recognizer.setAppKey(APP_KEY);
            recognizer.setFormat(InputFormatEnum.PCM);
            recognizer.setSampleRate(SampleRateEnum.SAMPLE_RATE_16K);
            recognizer.setEnableIntermediateResult(true);

            System.out.println("Starting recognition...");
            recognizer.start();
            System.out.println("Recognition started successfully");

            byte[] buffer = new byte[3200];
            int len;
            while ((len = inputStream.read(buffer)) > 0) {
                recognizer.send(buffer, len);
                int deltaSleep = getSleepDelta(len, 16000); // Assuming 16000 sample rate
                Thread.sleep(deltaSleep);
            }

            recognizer.stop();
            System.out.println("Recognition stopped successfully");
        } catch (Exception e) {
            System.err.println("Exception during recognition: " + e.getMessage());
            throw new Exception("Failed to recognize speech", e);
        } finally {
            if (recognizer != null) {
                recognizer.close();
                System.out.println("Recognizer closed");
            }
        }
        System.out.println("result.toString()"+result.toString());
        return result.toString();
    }

    public static int getSleepDelta(int dataSize, int sampleRate) {
        int sampleBytes = 16;
        int soundChannel = 1;
        return (dataSize * 10 * 8000) / (160 * sampleRate);
    }

    public void shutdown() {
        client.shutdown();
    }
}
