package com.aliyun.bailian.chatgpt.service;

public interface StringRedisService {
  String getKey(String key);

  void setKey(String key, String value);
}
