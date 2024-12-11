package com.aliyun.bailian.chatgpt.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.aliyun.bailian.chatgpt.client.LLmDashClient;
import com.aliyun.bailian.chatgpt.config.LlmConfig;
import com.aliyun.bailian.chatgpt.constants.Constants;
import com.aliyun.bailian.chatgpt.dto.DashLlmRequestDTO;
import com.aliyun.bailian.chatgpt.dto.MessageDto;
import com.aliyun.bailian.chatgpt.model.PosAutoLog;
import com.aliyun.bailian.chatgpt.service.StringRedisService;
import com.aliyun.bailian.chatgpt.utils.R;
import com.aliyun.broadscope.bailian.sdk.ApplicationClient;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsRequest;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class LlmDashSseController {

  @Autowired
  private LLmDashClient llmDashClient;

  @Autowired
  private StringRedisService stringRedisService;

  @Autowired
  private LlmConfig llmConfig;

  @Autowired
  private ApplicationClient applicationClient;

  List<String> list = List.of("1.开关窗户", "2.开关音乐", "3.开关电视机");

  @ResponseBody
  @PostMapping(value = "/checkMessage", produces = MediaType.APPLICATION_JSON_VALUE)
  public R<Object> checkMessage(@RequestBody MessageDto message) throws IOException {
    String msg = stringRedisService.getKey(Constants.YX_PROMPT);
    // if (StringUtils.isBlank(msg)) {
    // msg = new String(Files.readAllBytes(Paths.get(resource.getURI())));
    // }
    String ability = stringRedisService.getKey(Constants.ABILITY);
    if (StringUtils.isNotBlank(ability)) {
      msg = msg.replace("{list}", ability);
    } else {
      msg = msg.replace("{list}", JSON.toJSONString(list));
    }
    msg = msg.replace("{message}", message.getMessage());
    msg = msg + ",用户输入:" + message;
    CompletionsRequest completionsRequest = new CompletionsRequest();
    completionsRequest.setPrompt(msg);
    completionsRequest.setAppId(llmConfig.getAppIds().getOrDefault("text_chat", null));
    CompletionsResponse completions = applicationClient.completions(completionsRequest);
    String text = completions.getData().getText();
    JSONObject jsonObject = JSON.parseObject(text);
    PosAutoLog log = new PosAutoLog();
    log.setUserId(StringUtils.defaultString(message.getSessionId(), "system"));
    log.setQuestion(message.getMessage());
    log.setAnswer(jsonObject.toJSONString());
    log.setCreateTime(LocalDateTime.now());
    llmDashClient.savePosAutoLog(log);
    return R.success(jsonObject);
  }

  // 提供文本流 SSE 服务
  @PostMapping("/v1/stream-text")
  public SseEmitter streamText(@RequestBody DashLlmRequestDTO request) {
    return llmDashClient.streamText(request.getPrompt(), request.getSessionId());
  }

  // 提供语音流 SSE 服务
  @PostMapping("/v1/stream-speech")
  public SseEmitter streamSpeech(@RequestBody DashLlmRequestDTO request) {
    String prompt = request.getPrompt();
    String sessionId = request.getSessionId();
    String audioSource = request.getAudioSource();
    String VoiceName = request.getVoiceName();
    if (audioSource != null && audioSource.equals("alicloud")) {
      return llmDashClient.streamSpeech(prompt, sessionId, VoiceName);
    }
    return llmDashClient.streamSpeechWithXMLY(prompt, sessionId);
  }

  // 提供文本+语音流 SSE 服务
  @PostMapping("/v1/stream-speech-cosy")
  public SseEmitter streamTextAndSpeech(@RequestBody DashLlmRequestDTO request) {
    return llmDashClient.streamSpeechWithFlowCosyVoice(request.getPrompt(), request.getSessionId());
  }
}