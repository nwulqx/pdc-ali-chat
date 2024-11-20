package com.aliyun.bailian.chatgpt.controller;

import com.alibaba.fastjson.JSON;
import com.aliyun.bailian.chatgpt.client.LLmDashClient;
import com.aliyun.bailian.chatgpt.config.LlmConfig;
import com.aliyun.bailian.chatgpt.service.SpeechRecognitionService;
import com.aliyun.bailian.chatgpt.utils.PinYingUtil;
import com.aliyun.broadscope.bailian.sdk.ApplicationClient;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsRequest;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@Slf4j
@RequestMapping("/ytpdq")
public class YtpdqController {


  @javax.annotation.Resource
  private LlmConfig llmConfig;

  @Autowired
  private ApplicationClient applicationClient;
  @Autowired
  private SpeechRecognitionService speechRecognitionService;
  @Autowired
  private LLmDashClient llmDashClient;

  @Value("classpath:data_prompt.txt")
  private Resource resource;


  List<String> list = List.of("1.开关窗户", "2.开关音乐", "3.开关电视机");

  @GetMapping("/checkMessage")
  public String checkMessage(String message) throws IOException {
    String msg = new String(Files.readAllBytes(Paths.get(resource.getURI())));
    msg = msg.replace("{list}", JSON.toJSONString(list));
    msg = msg.replace("{message}", message);
    msg = msg + ",用户输入:" + message;
    CompletionsRequest completionsRequest = new CompletionsRequest();
    completionsRequest.setPrompt(msg);
    completionsRequest.setAppId(llmConfig.getAppIds().getOrDefault("text_chat", null));
    CompletionsResponse completions = applicationClient.completions(completionsRequest);
    return completions.getData().getText();
  }


  @PostMapping("/start/conversation")
  public SseEmitter startConversation(@RequestPart MultipartFile file) throws Exception {
    String msg =
        speechRecognitionService.recognizeSpeech(file);
    if (PinYingUtil.check(msg)) {
      return llmDashClient.streamSpeech("你是一个车机助手，现在有人叫你，你作为系统应该固定回复：在的，我是小保，很乐意为您服务！", null, "longxiaochun");
    }
    String result = checkMessage(msg);
    if (StringUtils.isNotBlank(result) && result.contains("desc")) {
      Boolean success = JSON.parseObject(result).getBoolean("success");
      if (success) {
        SseEmitter sseEmitter = new SseEmitter();
        sseEmitter.send(result);
        log.info("识别结果:{}", result);
        return sseEmitter;
      }
    }
    return  llmDashClient.streamSpeech(msg, null, "longxiaoxia");
  }

}
