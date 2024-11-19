package com.aliyun.bailian.chatgpt.config;

import com.aliyun.broadscope.bailian.sdk.AccessTokenClient;
import com.aliyun.broadscope.bailian.sdk.ApplicationClient;
import com.aliyun.broadscope.bailian.sdk.consts.ConfigConsts;
import com.aliyun.broadscope.bailian.sdk.models.ConnectOptions;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BaiLianClientConfig {

  @javax.annotation.Resource
  private LlmConfig llmConfig;

  @Bean
  public AccessTokenClient accessTokenClient() {
    String accessKeyId = llmConfig.getAccessKeyId();
    String accessKeySecret = llmConfig.getAccessKeySecret();
    String agentKey = llmConfig.getAgentKey();

    AccessTokenClient accessTokenClient = new AccessTokenClient(accessKeyId, accessKeySecret, agentKey);
    String popEndpoint = llmConfig.getPopEndpoint();
    if (StringUtils.isNotBlank(popEndpoint)) {
      accessTokenClient.setEndpoint(popEndpoint);
    }
    return accessTokenClient;
  }

  @Bean
  public ApplicationClient applicationClient() {
    int timeout = llmConfig.getTimeout() * 1000;
    return ApplicationClient.builder()
        .endpoint(llmConfig.getEndpoint())
        .token(accessTokenClient().getToken())
        .connectOptions(new ConnectOptions(timeout, timeout, timeout))
        .build();
  }

}
