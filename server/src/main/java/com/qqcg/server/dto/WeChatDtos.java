package com.qqcg.server.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

public class WeChatDtos {
  @Data
  public static class JsCode2SessionResp {
    @JsonProperty("openid")
    private String openId;

    @JsonProperty("session_key")
    private String sessionKey;

    @JsonProperty("unionid")
    private String unionId;

    @JsonProperty("errcode")
    private Integer errCode;

    @JsonProperty("errmsg")
    private String errMsg;
  }
}

