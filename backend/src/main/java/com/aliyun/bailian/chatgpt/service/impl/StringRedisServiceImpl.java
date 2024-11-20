package com.aliyun.bailian.chatgpt.service.impl;

import com.aliyun.bailian.chatgpt.service.StringRedisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class StringRedisServiceImpl implements StringRedisService {

  @Autowired
  private StringRedisTemplate stringRedisTemplate;

  @Override
  public String getKey(String key) {
    if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(key))) {
      return stringRedisTemplate.opsForValue().get(key);
    }
    return null;
  }

  @Override
  public void setKey(String key, String value) {
    stringRedisTemplate.opsForValue().set(key, value);
  }
}
