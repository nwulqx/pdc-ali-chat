package com.aliyun.bailian.chatgpt.controller;

import com.aliyun.bailian.chatgpt.service.SpeechRecognitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/recognizeSpeech")
public class SpeechRecognitionController {

  @Autowired
  private SpeechRecognitionService speechRecognitionService;

  @PostMapping("/recognize")
  public ResponseEntity<Map<String, Object>> recognize(@RequestPart("file") MultipartFile file) {
    Map<String, Object> response = new HashMap<>();
    try {
      String result = speechRecognitionService.recognizeSpeech(file);
      response.put("code", "0");
      response.put("data", result);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (Exception e) {
      response.put("code", "1");
      response.put("data", "Error: " + e.getMessage());
      return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
