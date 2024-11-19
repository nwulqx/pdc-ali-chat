package com.aliyun.bailian.chatgpt.controller;

import com.alibaba.fastjson.JSON;
import com.aliyun.bailian.chatgpt.client.BailianLlmClient;
import com.aliyun.bailian.chatgpt.config.LlmConfig;
import com.aliyun.broadscope.bailian.sdk.AccessTokenClient;
import com.aliyun.broadscope.bailian.sdk.ApplicationClient;
import com.aliyun.broadscope.bailian.sdk.consts.ConfigConsts;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsRequest;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsResponse;
import com.aliyun.broadscope.bailian.sdk.models.ConnectOptions;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/ytpdq")
public class YtpdqController {


  @javax.annotation.Resource
  private LlmConfig llmConfig;

  @Autowired
  private ApplicationClient applicationClient;

  @Value("classpath:data_prompt.txt")
  private Resource resource;
  List<String> list = List.of("1.开关窗户", "2.开关音乐", "3.开关电视机");

  @GetMapping("/checkMessage")
  public String checkMessage(String message) throws IOException {
    String msg =  new String(Files.readAllBytes(Paths.get(resource.getURI())));
    msg = msg.replace("{list}", JSON.toJSONString(list));
    msg = msg.replace("{message}", message);
    msg = msg +",用户输入:"+ message;
    CompletionsRequest completionsRequest = new CompletionsRequest();
    completionsRequest.setPrompt(msg);
    completionsRequest.setAppId(llmConfig.getAppIds().getOrDefault("text_chat", null));
    CompletionsResponse completions = applicationClient.completions(completionsRequest);
    return completions.getData().getText();
  }
}
