package com.aliyun.bailian.chatgpt.service;

import java.io.IOException;

import com.alibaba.nls.client.AccessToken;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final String accessKeyId;
    private final String accessKeySecret;
    private String token;
    private long expireTime;

    public TokenService(String accessKeyId, String accessKeySecret) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
    }

    public synchronized String getToken() {
        if (token == null || isTokenExpired()) {
            try {
                AccessToken accessToken = new AccessToken(accessKeyId, accessKeySecret);
                accessToken.apply();
                token = accessToken.getToken();
                expireTime = accessToken.getExpireTime()* 1000;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return token;
    }

    private boolean isTokenExpired() {
        return System.currentTimeMillis() >= expireTime;
    }
}
