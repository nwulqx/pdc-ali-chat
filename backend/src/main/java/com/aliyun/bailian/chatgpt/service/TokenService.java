package com.aliyun.bailian.chatgpt.service;

import java.io.IOException;

import com.alibaba.nls.client.AccessToken;
import com.alibaba.nls.client.protocol.NlsClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final String accessKeyId;
    private final String accessKeySecret;
    private final NlsClient nlsClient;
    private String token;
    private long expireTime;

    public TokenService(@Value("${chat.llm.accessKeyId}") String accessKeyId,
                        @Value("${chat.llm.accessKeySecret}") String accessKeySecret,
                        @Value("${aliyun.url}") String url) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        refreshToken(); // 初始化时获取 token
        this.nlsClient = new NlsClient(url, this.token); // 使用初始的 token 创建 NlsClient 实例
    }

    /**
     * 获取最新的 NlsClient 实例，确保使用的是有效的 token。
     */
    public synchronized NlsClient getNlsClient() {
        if (isTokenExpired()) {
            refreshTokenAndUpdateClient(); // 如果 token 过期，刷新 token 并更新 NlsClient
        }
        return nlsClient; // 返回更新过 token 的 NlsClient
    }

    /**
     * 获取最新的 token。
     * 仅获取 token，不更新 NlsClient 的 token。
     */
    public synchronized String getToken() {
        if (isTokenExpired()) {
            refreshToken(); // 如果 token 过期，刷新 token
        }
        return token;
    }

    /**
     * 检查 token 是否过期。
     */
    private boolean isTokenExpired() {
        return System.currentTimeMillis() >= expireTime;
    }

    /**
     * 刷新 token 逻辑，调用阿里云 API 获取新的 token。
     */
    private void refreshToken() {
        try {
            AccessToken accessToken = new AccessToken(accessKeyId, accessKeySecret);
            accessToken.apply();
            token = accessToken.getToken();
            expireTime = accessToken.getExpireTime() * 1000; // 设置过期时间，单位为毫秒
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to refresh token", e);
        }
    }

    /**
     * 刷新 token 并更新 NlsClient 的 token。
     */
    private void refreshTokenAndUpdateClient() {
        refreshToken(); // 刷新 token
        nlsClient.setToken(token); // 更新 NlsClient 的 token
    }
}
