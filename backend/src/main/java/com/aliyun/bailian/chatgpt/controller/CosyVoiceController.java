package com.aliyun.bailian.chatgpt.controller;

import com.aliyun.bailian.chatgpt.client.CosyVoiceClient;
import com.aliyun.bailian.chatgpt.dto.CosyVoiceListResponseDTO;
import com.aliyun.bailian.chatgpt.dto.CosyVoiceCloneResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import javax.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class CosyVoiceController {

    @Autowired
    private CosyVoiceClient cosyVoiceClient;

    @Value("${TTSFlowing.uploadAudioDir:/uploadAudio}")
    private String UPLOAD_DIR;

    @Value("${TTSFlowing.baseUrl:https://121.43.108.153}")
    private String baseUrl;

    @PostMapping("/v1/cosy-list")
    public ResponseEntity<CosyVoiceListResponseDTO> getCosyList(
            @RequestBody(required = false) Map<String, Object> requestBody) {
        String voicePrefix = "pdc";
        Integer pageIndex = 1;
        Integer pageSize = 10;

        if (requestBody != null) {
            if (requestBody.containsKey("voicePrefix")) {
                voicePrefix = (String) requestBody.get("voicePrefix");
            }
            if (requestBody.containsKey("pageIndex")) {
                pageIndex = (Integer) requestBody.get("pageIndex");
            }
            if (requestBody.containsKey("pageSize")) {
                pageSize = (Integer) requestBody.get("pageSize");
            }
        }

        CosyVoiceListResponseDTO response = cosyVoiceClient.cosyList(voicePrefix, pageIndex, pageSize);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/v1/cosy-clone")
    public ResponseEntity<Map<String, Object>> queryCosyClone(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "voicePrefix", required = false) String voicePrefix,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (voicePrefix == null) {
                voicePrefix = "pdc";
            }

            // 确保上传目录存在
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                try {
                    Files.createDirectories(uploadPath);
                } catch (IOException e) {
                    throw new IOException("无法创建上传目录: " + e.getMessage(), e);
                }
            }

            // 生成唯一的文件名
            String fileName = UUID.randomUUID().toString() + getFileExtension(file.getOriginalFilename());
            Path filePath = uploadPath.resolve(fileName);

            // 保存文件
            try {
                Files.write(filePath, file.getBytes());
            } catch (IOException e) {
                throw new IOException("无法写入文件: " + e.getMessage(), e);
            }

            // 生成可访问的URL
            String fileUrl = baseUrl + "/audio/" + fileName;
            System.out.println("fileUrl: " + fileUrl);

            // 调用cosyClone方法
            CosyVoiceCloneResponseDTO cloneResponse = cosyVoiceClient.cosyClone(fileUrl, voicePrefix);

            // 构建响应
            response.put("message", "文件上传成功");
            response.put("fileUrl", fileUrl);
            response.put("cloneResponse", cloneResponse);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("error", "文件上传失败: " + e.getMessage());
            e.printStackTrace(); // 打印堆栈跟踪以便调试
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("error", "克隆处理失败: " + e.getMessage());
            e.printStackTrace(); // 打印堆栈跟踪以便调试
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) {
            return "";
        }
        int lastIndexOf = fileName.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return fileName.substring(lastIndexOf);
    }
}