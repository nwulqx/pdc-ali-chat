package com.aliyun.bailian.chatgpt.controller;

import com.aliyun.bailian.chatgpt.dto.TtsDto;
import com.aliyun.bailian.chatgpt.dto.WavHeaderDto;
import com.aliyun.bailian.chatgpt.service.impl.TtsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/v1/tts")
public class TtsController {

  @Autowired
  private TtsService ttsService;

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = "audio/wav")
  public ResponseEntity<byte[]> synthesize(@RequestBody TtsDto request) throws IOException {
    byte[] audioData = ttsService.synthesize(request.getData());
    ByteArrayOutputStream out = new ByteArrayOutputStream();

    WavHeaderDto header = new WavHeaderDto();
    header.fileLength = audioData.length + 44 - 8;
    header.fmtHdrLeth = 16;
    header.bitsPerSample = 16;
    header.channels = 1;
    header.formatTag = 0x0001;
    header.samplesPerSec = 16000;
    header.blockAlign = (short) (header.channels * header.bitsPerSample / 8);
    header.avgBytesPerSec = header.blockAlign * header.samplesPerSec;
    header.dataHdrLeth = audioData.length;
    out.write(header.getHeader());
    out.write(audioData);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    headers.setContentLength(out.size());
    return ResponseEntity.ok().headers(headers).body(out.toByteArray());
  }
}
