package com.aliyun.bailian.chatgpt.service;

import org.springframework.web.multipart.MultipartFile;

public interface SpeechRecognitionService {
    String recognizeSpeech(MultipartFile file) throws Exception;
}
