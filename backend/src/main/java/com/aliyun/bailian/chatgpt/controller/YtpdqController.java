package com.aliyun.bailian.chatgpt.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.aliyun.bailian.chatgpt.client.LLmDashClient;
import com.aliyun.bailian.chatgpt.config.LlmConfig;
import com.aliyun.bailian.chatgpt.constants.Constants;
import com.aliyun.bailian.chatgpt.dto.MessageDto;
import com.aliyun.bailian.chatgpt.model.PosAutoLog;
import com.aliyun.bailian.chatgpt.service.PosAutoLogService;
import com.aliyun.bailian.chatgpt.service.SpeechRecognitionService;
import com.aliyun.bailian.chatgpt.service.StringRedisService;
import com.aliyun.bailian.chatgpt.utils.PinYingUtil;
import com.aliyun.bailian.chatgpt.utils.R;
import com.aliyun.broadscope.bailian.sdk.ApplicationClient;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsRequest;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@Slf4j
@RequestMapping("/ytpdq")
@CrossOrigin(origins = {"*"})
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

  @Autowired
  private StringRedisService stringRedisService;

  @Autowired
  private PosAutoLogService posAutoLogService;


  List<String> list = List.of("1.开关窗户", "2.开关音乐", "3.开关电视机");

  /**
   * 初始化缓存数据
   * @return
   * @throws IOException
   */
  @GetMapping("/init")
  public String init() throws IOException {
    stringRedisService.setKey(Constants.CHECK_XIAO_BAO, "xiao bao");
    stringRedisService.setKey(Constants.YX_PROMPT, new String(Files.readAllBytes(Paths.get(resource.getURI()))));
    stringRedisService.setKey(Constants.XIAO_BAO_MUSIC_MODEL, "longxiaochun");
    stringRedisService.setKey(Constants.DEFAULT_XIAO_BAO_TXT,
        "你是一个车机助手，现在有人叫你，你作为系统应该固定回复：在的，我是小保，很乐意为您服务!");
    stringRedisService.setKey(Constants.ABILITY, JSON.toJSONString(list));
    stringRedisService.setKey(Constants.MUSIC_MODEL, "longxiaochun");
    return "init";
  }
  /**
   * 检查消息意向
   * @param message
   * @return
   * @throws IOException
   */
  @PostMapping(value = "/checkMessage")
  public R<JSONObject> checkMessage(@RequestBody MessageDto message) throws IOException {
    String msg = stringRedisService.getKey(Constants.YX_PROMPT);
    if (StringUtils.isBlank(msg)) {
      msg = new String(Files.readAllBytes(Paths.get(resource.getURI())));
    }
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
    log.info("识别结果:{}", text);
    PosAutoLog log = new PosAutoLog();
    log.setUserId(StringUtils.defaultString(message.getSessionId(), "system"));
    log.setQuestion(message.getMessage());
    log.setAnswer(jsonObject.toJSONString());
    log.setCreateTime(LocalDateTime.now());
    posAutoLogService.savePosAutoLog(log);
    return R.success(jsonObject);
  }

  /**
   * 开启对话
   * @param file
   * @return
   * @throws Exception
   */
  @PostMapping("/open")
  public SseEmitter openConversation(@RequestPart MultipartFile file) throws Exception {
    String msg = speechRecognitionService.recognizeSpeech(file);
    if (PinYingUtil.check(msg, stringRedisService.getKey(Constants.CHECK_XIAO_BAO))) {
      String defaultTxt = stringRedisService.getKey(Constants.DEFAULT_XIAO_BAO_TXT);
      if (StringUtils.isBlank(defaultTxt)) {
        defaultTxt = "你是一个车机助手，现在有人叫你，你作为系统应该固定回复：在的，我是小保，很乐意为您服务！";
      }
      String defaultMusicModel = stringRedisService.getKey(Constants.XIAO_BAO_MUSIC_MODEL);
      if (StringUtils.isBlank(defaultMusicModel)) {
        defaultMusicModel = "longxiaochun";
      }
      return llmDashClient.streamSpeech(defaultTxt, null, defaultMusicModel);
    }
    return null;
  }


  @PostMapping("/streamChat")
  public SseEmitter streamChat(@RequestPart MultipartFile file) throws Exception {
    String msg =
        speechRecognitionService.recognizeSpeech(file);
    String voiceName = stringRedisService.getKey(Constants.MUSIC_MODEL);
    if (StringUtils.isNotBlank(voiceName)) {
      voiceName = "longxiaochun";
    }
    return llmDashClient.streamSpeech(msg, null, voiceName);
  }


  @PostMapping("/start/conversation")
  public SseEmitter startConversation(@RequestPart MultipartFile file) throws Exception {
    String msg =
        speechRecognitionService.recognizeSpeech(file);
    if (PinYingUtil.check(msg, stringRedisService.getKey(Constants.CHECK_XIAO_BAO))) {
      String defaultTxt = stringRedisService.getKey(Constants.DEFAULT_XIAO_BAO_TXT);
      if (StringUtils.isBlank(defaultTxt)) {
        defaultTxt = "你是一个车机助手，现在有人叫你，你作为系统应该固定回复：在的，我是小保，很乐意为您服务！";
      }
      String defaultMusicModel = stringRedisService.getKey(Constants.XIAO_BAO_MUSIC_MODEL);
      if (StringUtils.isBlank(defaultMusicModel)) {
        defaultMusicModel = "longxiaochun";
      }
      return llmDashClient.streamSpeech(defaultTxt, null, defaultMusicModel);
    }
    MessageDto messageDto = new MessageDto();
    messageDto.setMessage(msg);
    JSONObject result = checkMessage(messageDto).getData();
    if (result !=null && result.containsKey("desc")) {
      Boolean success = result.getBoolean("success");
      if (success) {
        SseEmitter sseEmitter = new SseEmitter();
        sseEmitter.send(result);
        log.info("识别结果:{}", result);
        return sseEmitter;
      }
    }
    String voiceName = stringRedisService.getKey(Constants.MUSIC_MODEL);
    if (StringUtils.isNotBlank(voiceName)) {
      voiceName = "longxiaochun";
    }
    return llmDashClient.streamSpeech(msg, null, voiceName);
  }

}
