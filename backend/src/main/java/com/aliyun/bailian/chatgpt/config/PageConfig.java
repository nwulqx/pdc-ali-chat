package com.aliyun.bailian.chatgpt.config;

import com.aliyun.bailian.chatgpt.model.ChatTabConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author yuanci
 */
@Component
public class PageConfig {
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    private String pageConfigStr;

    private Map<String, Object> pageConfigMap;

    private Map<String, ChatTabConfig> chatTabsMap;

    @Autowired
    public PageConfig(ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @PostConstruct()
    public void init() throws IOException {
        loadConfing();
    }

    public void loadConfing() throws IOException {
        ClassPathResource resource = new ClassPathResource("page_config.json");
        pageConfigStr = new String(Files.readAllBytes(resource.getFile().toPath()));
        pageConfigMap = objectMapper.readValue(pageConfigStr, Map.class);

        List<Map<String, String>> list = (List<Map<String, String>>) pageConfigMap.get("chatTabs");
        chatTabsMap = list.stream().collect(Collectors.toMap(m -> m.get("code"),
                m -> new ChatTabConfig(m.get("title"), m.get("type"), m.get("code"))));
    }

    public String getPageConfigStr() {
        return pageConfigStr;
    }

    public Map<String, Object> getPageConfigMap() {
        return pageConfigMap;
    }

    public Map<String, ChatTabConfig> getChatTabsMap() {
        return chatTabsMap;
    }
}
