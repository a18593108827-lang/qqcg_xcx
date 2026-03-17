package com.qqcg.server.service;

import com.qqcg.server.dto.WeChatDtos;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WeChatAuthService {
  private final RestClient restClient = RestClient.create();

  @Value("${wechat.appid:}")
  private String appId;

  @Value("${wechat.secret:}")
  private String secret;

  public String getOpenIdByCode(String code) {
    if (appId == null || appId.isBlank() || secret == null || secret.isBlank()) {
      throw new IllegalStateException("WX_APPID/WX_SECRET not configured");
    }

    WeChatDtos.JsCode2SessionResp resp = restClient.get()
      .uri(uriBuilder -> uriBuilder
        .scheme("https")
        .host("api.weixin.qq.com")
        .path("/sns/jscode2session")
        .queryParam("appid", appId)
        .queryParam("secret", secret)
        .queryParam("js_code", code)
        .queryParam("grant_type", "authorization_code")
        .build())
      .accept(MediaType.APPLICATION_JSON)
      .retrieve()
      .body(WeChatDtos.JsCode2SessionResp.class);

    if (resp == null) throw new IllegalStateException("empty wechat response");
    if (resp.getErrCode() != null && resp.getErrCode() != 0) {
      throw new IllegalStateException("wechat error " + resp.getErrCode() + ": " + resp.getErrMsg());
    }
    if (resp.getOpenId() == null || resp.getOpenId().isBlank()) {
      throw new IllegalStateException("wechat openid missing");
    }
    return resp.getOpenId();
  }
}

