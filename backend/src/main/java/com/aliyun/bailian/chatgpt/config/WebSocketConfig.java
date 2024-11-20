package com.aliyun.bailian.chatgpt.config;
import com.aliyun.bailian.chatgpt.service.impl.TTSWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private TTSWebSocketHandler ttsWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        System.out.println("Registering WebSocket handlers");
        registry.addHandler(ttsWebSocketHandler, "/ws/tts")
                .setAllowedOrigins("*");  // 允许所有来源连接
    }
}
