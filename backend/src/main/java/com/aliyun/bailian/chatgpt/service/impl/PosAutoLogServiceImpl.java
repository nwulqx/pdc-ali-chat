package com.aliyun.bailian.chatgpt.service.impl;

import com.aliyun.bailian.chatgpt.mapper.PosAutoLogMapper;
import com.aliyun.bailian.chatgpt.model.PosAutoLog;
import com.aliyun.bailian.chatgpt.service.PosAutoLogService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PosAutoLogServiceImpl extends ServiceImpl<PosAutoLogMapper, PosAutoLog> implements PosAutoLogService {

  @Override
  public boolean savePosAutoLog(PosAutoLog log) {
    return save(log);
  }

  @Override
  public List<PosAutoLog> getByUserId(String userId) {
    LambdaQueryWrapper<PosAutoLog> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(PosAutoLog::getUserId, userId);
    return list(queryWrapper);
  }
}
