package com.aliyun.bailian.chatgpt.service.impl;

import com.aliyun.bailian.chatgpt.config.XMLYSpeechConfig;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisRequest;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisResponse;
import com.aliyun.bailian.chatgpt.dto.SpeechSynthesisResultDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SpeechSynthesisService {

    private final RestTemplate restTemplate;
    private final String baseUrl = "https://audio-ai.ximalaya.com";
    private final ObjectMapper objectMapper;
    private final XMLYSpeechConfig xmlySpeechConfig;

    @Autowired
    public SpeechSynthesisService(RestTemplate restTemplate, ObjectMapper objectMapper,
            XMLYSpeechConfig xmlySpeechConfig) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.xmlySpeechConfig = xmlySpeechConfig;
    }

    public SpeechSynthesisResponse initiateSpeechSynthesis(SpeechSynthesisRequest request) {
        String url = baseUrl + "/has/lmtts/api/v1/synth/async";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", xmlySpeechConfig.getAuthToken());
        HttpEntity<SpeechSynthesisRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        try {
            return objectMapper.readValue(response.getBody(), SpeechSynthesisResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing speech synthesis response", e);
        }
    }

    public SpeechSynthesisResultDTO fetchSpeechSynthesisResult(String requestId) {
        String url = baseUrl + "/has/lmtts/api/v1/synth/async/" + requestId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", xmlySpeechConfig.getAuthToken());
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        try {
            return objectMapper.readValue(response.getBody(), SpeechSynthesisResultDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing speech synthesis result", e);
        }
    }
}