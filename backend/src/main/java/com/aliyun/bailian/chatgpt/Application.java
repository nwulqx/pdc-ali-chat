package com.aliyun.bailian.chatgpt;

import org.mybatis.spring.annotation.MapperScan;
import org.mybatis.spring.annotation.MapperScans;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Application entry
 *
 * @author yuanci
 */
@SpringBootApplication(scanBasePackages = "com.aliyun.bailian.chatgpt")
@EnableFeignClients(basePackages = "com.aliyun.bailian.chatgpt.service") // 添加此行
@MapperScan("com.aliyun.bailian.chatgpt.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args).registerShutdownHook();
    }
}
