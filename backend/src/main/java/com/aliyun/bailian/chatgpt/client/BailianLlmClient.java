package com.aliyun.bailian.chatgpt.client;

import com.alibaba.fastjson.JSONObject;
import com.aliyun.bailian.chatgpt.config.LlmConfig;
import com.aliyun.bailian.chatgpt.dto.CompletionRequestDTO;
import com.aliyun.bailian.chatgpt.enums.ChatTypeEnum;
import com.aliyun.broadscope.bailian.sdk.AccessTokenClient;
import com.aliyun.broadscope.bailian.sdk.ApplicationClient;
import com.aliyun.broadscope.bailian.sdk.consts.ConfigConsts;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsRequest;
import com.aliyun.broadscope.bailian.sdk.models.CompletionsResponse;
import com.aliyun.broadscope.bailian.sdk.models.ConnectOptions;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Flux;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.List;
import java.util.stream.Collectors;


/**
 * 调用阿里云百炼大模型服务
 *
 * @author yuanci
 */

@Component
public class BailianLlmClient {

    @Resource
    private LlmConfig llmConfig;

    private AccessTokenClient accessTokenClient;

    private String endpoint;

    @PostConstruct
    public void init() {
        String accessKeyId = llmConfig.getAccessKeyId();
        String accessKeySecret = llmConfig.getAccessKeySecret();
        String agentKey = llmConfig.getAgentKey();

        accessTokenClient = new AccessTokenClient(accessKeyId, accessKeySecret, agentKey);
        String popEndpoint = llmConfig.getPopEndpoint();
        if (StringUtils.isNotBlank(popEndpoint)) {
            accessTokenClient.setEndpoint(popEndpoint);
        }

        String endpoint = llmConfig.getEndpoint();
        if (StringUtils.isNotBlank(endpoint)) {
            this.endpoint = endpoint;
        } else {
            this.endpoint = ConfigConsts.ENDPOINT;
        }
    }

    /**
     * 调用大模型服务，并进行流式结果响应
     *
     * @param completionRequest 请求参数
     * @return 流式响应结果
     */
    public Flux<CompletionsResponse> createStreamCompletion(CompletionRequestDTO completionRequest) {
        String token = accessTokenClient.getToken();
        int timeout = llmConfig.getTimeout() * 1000;

        ApplicationClient client = ApplicationClient.builder()
                .endpoint(endpoint)
                .token(token)
                .connectOptions(new ConnectOptions(timeout, timeout, timeout))
                .build();

        String requestId = completionRequest.getRequestId();
        String prompt = completionRequest.getContent();
        CompletionsRequest request = new CompletionsRequest()
                .setRequestId(requestId)
                .setPrompt(prompt);

        if (!CollectionUtils.isEmpty(completionRequest.getChatMessages())) {
            List<CompletionsRequest.ChatQaPair> history = completionRequest.getChatMessages().stream().map(item ->
                            new CompletionsRequest.ChatQaPair(item.getUser(), item.getAssistant()))
                    .collect(Collectors.toList());
            request.setHistory(history);
        }

        String appId = llmConfig.getAppIds().get(completionRequest.getCode());
        request.setAppId(appId);
        if (ChatTypeEnum.DOC_CHAT.getType().equalsIgnoreCase(completionRequest.getSessionType())) {
            //doc llm app
            JSONObject object = new JSONObject();
            object.put("userId", completionRequest.getUserId());
            object.put("dataId", completionRequest.getDataId());
            request.setBizParams(object);
        }
        String sessionId = completionRequest.getSessionId();
        if(StringUtils.isNotBlank(sessionId)){
            request.setSessionId(sessionId);
        }

        return client.streamCompletions(request);
    }
}
