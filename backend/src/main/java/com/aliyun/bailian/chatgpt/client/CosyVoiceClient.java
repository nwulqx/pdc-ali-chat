package com.aliyun.bailian.chatgpt.client;

import com.aliyun.bailian.chatgpt.config.LlmConfig;
import com.aliyuncs.CommonRequest;
import com.aliyuncs.CommonResponse;
import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.IAcsClient;
import com.aliyuncs.exceptions.ClientException;
import com.aliyuncs.exceptions.ServerException;
import com.aliyuncs.http.MethodType;
import com.aliyuncs.http.ProtocolType;
import com.aliyuncs.profile.DefaultProfile;
import org.springframework.stereotype.Component;
import com.aliyun.bailian.chatgpt.dto.CosyVoiceListResponseDTO;
import com.aliyun.bailian.chatgpt.dto.CosyVoiceCloneResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.annotation.Resource;

@Component
public class CosyVoiceClient {
    @Resource
    private LlmConfig llmConfig;
    // 域名
    private final String DOMAIN = "nls-slp.cn-shanghai.aliyuncs.com";

    private final String API_VERSION = "2019-08-19";

    private final IAcsClient client;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public CosyVoiceClient(LlmConfig llmConfig) {
        DefaultProfile profile = DefaultProfile.getProfile(
                "cn-shanghai",
                llmConfig.getAccessKeyId(),
                llmConfig.getAccessKeySecret());
        this.client = new DefaultAcsClient(profile);
    }

    public CosyVoiceListResponseDTO cosyList(String voicePrefix) {
        CommonRequest request = buildRequest("ListCosyVoice");
        request.putBodyParameter("VoicePrefix", voicePrefix);
        request.putBodyParameter("PageSize", 200);
        request.putBodyParameter("PageIndex", 1);
        String response = sendRequest(request);
        try {
            return objectMapper.readValue(response, CosyVoiceListResponseDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public CosyVoiceCloneResponseDTO cosyClone(String filePath, String voicePrefix) {
        CommonRequest cloneRequest = buildRequest("CosyVoiceClone");
        cloneRequest.putBodyParameter("VoicePrefix", voicePrefix);
        cloneRequest.putBodyParameter("Url", filePath);
        // 设定等待超时时间为15s
        cloneRequest.setSysReadTimeout(15000);
        long startTime = System.currentTimeMillis();
        String response = sendRequest(cloneRequest);
        long endTime = System.currentTimeMillis();
        System.out.println(response);
        System.out.println("cost: " + (endTime - startTime) + " 毫秒");
        try {
            return objectMapper.readValue(response, CosyVoiceCloneResponseDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private CommonRequest buildRequest(String popApiName) {
        CommonRequest request = new CommonRequest();
        request.setSysMethod(MethodType.POST);
        request.setSysDomain(DOMAIN);
        request.setSysVersion(API_VERSION);
        request.setSysAction(popApiName);
        request.setSysProtocol(ProtocolType.HTTPS);
        return request;
    }

    private String sendRequest(CommonRequest request) {
        try {
            CommonResponse response = client.getCommonResponse(request);
            return response.getData();
        } catch (ServerException e) {
            e.printStackTrace();
        } catch (ClientException e) {
            e.printStackTrace();
        }
        return null;
    }
}