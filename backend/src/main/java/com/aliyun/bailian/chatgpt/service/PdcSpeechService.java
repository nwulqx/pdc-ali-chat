package com.aliyun.bailian.chatgpt.service;

import com.aliyun.bailian.chatgpt.config.PdcFeignClientConfig;
import com.aliyun.bailian.chatgpt.dto.PdcRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "pdcClient", url = "#{@pdcFeignClientConfig.getUrl()}")
@Import(PdcFeignClientConfig.class)
public interface PdcSpeechService {

    @PostMapping(value = "/v1/audio/speech", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    byte[] synthesizeSpeech(@RequestBody PdcRequest request, @RequestHeader("Content-Type") String contentType);
}
