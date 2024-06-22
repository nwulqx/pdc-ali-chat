package com.aliyun.bailian.chatgpt.controller;


import com.aliyun.bailian.chatgpt.service.SpeechRecognitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/recognizeSpeech")
public class SpeechRecognitionController {

    @Autowired
    private SpeechRecognitionService speechRecognitionService;

    @PostMapping
    public String recognize(@RequestPart("file") MultipartFile file) {
        try {
            String result = speechRecognitionService.recognizeSpeech(file);

            System.out.println("result"+result);
            return result;
        } catch (Exception e) {
        return "Error";        }
    }
}
