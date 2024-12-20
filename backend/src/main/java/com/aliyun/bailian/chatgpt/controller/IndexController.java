package com.aliyun.bailian.chatgpt.controller;

import com.aliyun.bailian.chatgpt.config.PageConfig;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author yuanci
 */
@Controller
public class IndexController {

  @Resource
  private PageConfig pageConfig;

  @GetMapping(value = {"/"})
  public String index(Model model) throws IOException {
    model.addAttribute("pageConfig", pageConfig.getPageConfigStr());
    return "index";
  }
}
