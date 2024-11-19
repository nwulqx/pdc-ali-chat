package com.aliyun.bailian.chatgpt.utils;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
public class Base64ToMultipartFileUtil {
  public static MultipartFile convertBase64ToMultipartFile(String base64) throws IOException {
    // Base64 解码
    String[] parts = base64.split(","); // 如有前缀可以用此行分割
    byte[] decodedBytes = Base64.getDecoder().decode(parts[0]);
    // 创建一个输入流
    InputStream inputStream = new ByteArrayInputStream(decodedBytes);
    // 使用 MockMultipartFile 构造 MultipartFile
    String fileName = UUIDGenerator.generate() + ".wav";
    return new MockMultipartFile(fileName, fileName, "text/plain", inputStream);
  }
}
