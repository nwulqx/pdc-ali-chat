package com.aliyun.bailian.chatgpt.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("pos_auto_log")
public class PosAutoLog {

  @TableId(value = "id", type = IdType.AUTO)
  private Long id;

  private String UserId;

  private String question;

  private String answer;

  private LocalDateTime createTime;

}
