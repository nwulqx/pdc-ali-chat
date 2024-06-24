package com.aliyun.bailian.chatgpt.controller;

import com.aliyun.bailian.chatgpt.dto.PdcRequest;
import com.aliyun.bailian.chatgpt.service.PdcSpeechService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/pdc/tts")
public class PdcSpeechController {

    @Autowired
    private PdcSpeechService pdcSpeechService;


    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> synthesize(@RequestBody PdcRequest request) {
        byte[] audioData = pdcSpeechService.synthesizeSpeech(request, MediaType.APPLICATION_JSON_VALUE);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentLength(audioData.length);
        return ResponseEntity.ok().headers(headers).body(audioData);
    }
}
