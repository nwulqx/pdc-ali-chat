package com.aliyun.bailian.chatgpt.service;

import com.aliyun.bailian.chatgpt.model.PosAutoLog;
import java.util.List;

public interface PosAutoLogService {

  boolean savePosAutoLog(PosAutoLog log);

  List<PosAutoLog> getByUserId(String userId);
}
