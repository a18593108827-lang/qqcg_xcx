package com.qqcg.server.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDtos {
  @Data
  public static class LoginReq {
    @NotBlank
    private String openId;
    private String nickname;
    private String avatarUrl;
  }

  @Data
  public static class LoginResp {
    private Long userId;
    private String openId;
    private String nickname;
    private String avatarUrl;
  }
}

