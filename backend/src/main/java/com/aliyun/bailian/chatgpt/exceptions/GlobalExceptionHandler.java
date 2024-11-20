package com.aliyun.bailian.chatgpt.exceptions;

import com.alibaba.fastjson.JSON;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(Exception.class)
  public String exceptionHandler() {
    Map<String, Object> map = new HashMap<>();
    map.put("code", 500);
    map.put("msg", "系统异常");
    return JSON.toJSONString(map);
  }

}
