package com.aliyun.bailian.chatgpt.exceptions;

import com.aliyun.bailian.chatgpt.utils.R;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(Exception.class)
  public R exceptionHandler() {
    Map<String, Object> map = new HashMap<>();
    map.put("code", 500);
    map.put("msg", "系统异常");
    return R.success(map);
  }

}
