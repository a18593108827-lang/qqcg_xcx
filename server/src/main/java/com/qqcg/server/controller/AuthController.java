package com.qqcg.server.controller;

import com.qqcg.server.dto.AuthDtos;
import com.qqcg.server.entity.UserEntity;
import com.qqcg.server.repo.UserRepository;
import com.qqcg.server.service.SessionService;
import com.qqcg.server.service.WeChatAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository userRepository;
  private final WeChatAuthService weChatAuthService;
  private final SessionService sessionService;

  public AuthController(UserRepository userRepository, WeChatAuthService weChatAuthService, SessionService sessionService) {
    this.userRepository = userRepository;
    this.weChatAuthService = weChatAuthService;
    this.sessionService = sessionService;
  }

  @PostMapping("/login")
  public AuthDtos.LoginResp login(@Valid @RequestBody AuthDtos.LoginReq req) {
    UserEntity u = userRepository.findByOpenId(req.getOpenId()).orElseGet(() -> {
      UserEntity nu = new UserEntity();
      nu.setOpenId(req.getOpenId());
      nu.setNickname(req.getNickname());
      nu.setAvatarUrl(req.getAvatarUrl());
      return userRepository.save(nu);
    });

    // allow refresh nickname/avatar
    boolean changed = false;
    if (req.getNickname() != null && !req.getNickname().isBlank() && !req.getNickname().equals(u.getNickname())) {
      u.setNickname(req.getNickname());
      changed = true;
    }
    if (req.getAvatarUrl() != null && !req.getAvatarUrl().isBlank() && !req.getAvatarUrl().equals(u.getAvatarUrl())) {
      u.setAvatarUrl(req.getAvatarUrl());
      changed = true;
    }
    if (changed) {
      u = userRepository.save(u);
    }

    AuthDtos.LoginResp resp = new AuthDtos.LoginResp();
    resp.setUserId(u.getId());
    resp.setOpenId(u.getOpenId());
    resp.setNickname(u.getNickname());
    resp.setAvatarUrl(u.getAvatarUrl());
    resp.setToken(sessionService.issueToken(u.getId()));
    return resp;
  }

  @PostMapping("/wxLogin")
  public AuthDtos.LoginResp wxLogin(@Valid @RequestBody AuthDtos.WxLoginReq req) {
    String openId = weChatAuthService.getOpenIdByCode(req.getCode());
    AuthDtos.LoginReq r = new AuthDtos.LoginReq();
    r.setOpenId(openId);
    r.setNickname(req.getNickname());
    r.setAvatarUrl(req.getAvatarUrl());
    return login(r);
  }

  @PostMapping("/logout")
  public void logout(@RequestAttribute("userId") Long userId) {
    sessionService.revoke(userId);
  }
}

