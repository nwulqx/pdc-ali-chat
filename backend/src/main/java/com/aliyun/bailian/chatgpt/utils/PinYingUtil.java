package com.aliyun.bailian.chatgpt.utils;

import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinCaseType;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import net.sourceforge.pinyin4j.format.exception.BadHanyuPinyinOutputFormatCombination;

public class PinYingUtil {

//  public static String DEFAULT_SEPARATOR = "xiao bao xiaobao";
public static String DEFAULT_SEPARATOR = "bei jing";


  public static boolean check(String input) {
    StringBuilder pinyin = new StringBuilder();
    HanyuPinyinOutputFormat outputFormat = new HanyuPinyinOutputFormat();
    outputFormat.setCaseType(HanyuPinyinCaseType.LOWERCASE);
    outputFormat.setToneType(net.sourceforge.pinyin4j.format.HanyuPinyinToneType.WITHOUT_TONE);
    for (char c : input.toCharArray()) {
      String[] result = null;
      try {
        result = PinyinHelper.toHanyuPinyinStringArray(c,outputFormat);
      } catch (BadHanyuPinyinOutputFormatCombination e) {
        throw new RuntimeException(e);
      }
      if (result != null) {
        // 获取拼音并转换为小写
        pinyin.append(result[0]).append(" ");
      } else {
        // 如果是非汉字，直接添加原字符
        pinyin.append(c).append(" ");
      }
    }
    return pinyin.toString().trim().contains(DEFAULT_SEPARATOR);
  }

}
