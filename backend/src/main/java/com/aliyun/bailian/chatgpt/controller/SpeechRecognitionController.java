package com.aliyun.bailian.chatgpt.controller;

import com.alibaba.fastjson.JSONObject;
import com.aliyun.bailian.chatgpt.dto.Result;
import com.aliyun.bailian.chatgpt.enums.ErrorCodeEnum;
import com.aliyun.bailian.chatgpt.service.SpeechRecognitionService;
import com.aliyun.bailian.chatgpt.utils.LogUtils;
import com.aliyun.bailian.chatgpt.utils.UUIDGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;

@RestController
@RequestMapping("/v1")
public class SpeechRecognitionController {

    @Autowired
    private SpeechRecognitionService speechRecognitionService;

    @PostMapping(value = "/recognizeSpeech")
    public String recognizeSpeech(@RequestPart("file") MultipartFile file,
                                                HttpServletResponse response) {
        long startTime = System.currentTimeMillis();
        String requestId = UUIDGenerator.generate(); // 需要从前端传递或者生成一个唯一的请求ID
        LogUtils.trace(requestId, "recognizeSpeech", "START", startTime, null, null);

        try {
            response.setContentType("text/event-stream");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("X-Accel-Buffering", "no");

            InputStream inputStream = file.getInputStream();
            String result = speechRecognitionService.recognize(inputStream);
            System.out.println("result"+result);
            return result;
        } catch (Exception e) {
            LogUtils.monitor(requestId, "SpeechRecognitionController", "recognizeSpeech", "error",
                    startTime, null, e);
            return ErrorCodeEnum.CREATE_COMPLETION_ERROR.getErrorCode();
        }
    }
}
