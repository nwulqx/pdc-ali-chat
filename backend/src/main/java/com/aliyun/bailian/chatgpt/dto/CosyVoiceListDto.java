package com.aliyun.bailian.chatgpt.dto;

import lombok.Data;

@Data
public class CosyVoiceListDto {
  String voicePrefix;
  Integer pageIndex;
  Integer pageSize;
}
