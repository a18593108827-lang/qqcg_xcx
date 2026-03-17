package com.qqcg.server.controller;

import com.qqcg.server.entity.UserEntity;
import com.qqcg.server.repo.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserRepository userRepository;

  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/me")
  public Map<String, Object> me(@RequestParam("userId") Long userId) {
    UserEntity u = userRepository.findById(userId).orElseThrow();
    return Map.of(
      "id", u.getId(),
      "openId", u.getOpenId(),
      "nickname", u.getNickname(),
      "avatarUrl", u.getAvatarUrl()
    );
  }
}

