package com.qqcg.server.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class SessionService {
  private static final Duration TTL = Duration.ofDays(30);

  private final StringRedisTemplate redis;

  public SessionService(StringRedisTemplate redis) {
    this.redis = redis;
  }

  public String issueToken(Long userId) {
    String token = UUID.randomUUID().toString().replace("-", "");
    String tokenKey = tokenKey(token);
    String userKey = userKey(userId);

    // single-device login: invalidate old token if exists
    String oldToken = redis.opsForValue().get(userKey);
    if (oldToken != null && !oldToken.isBlank()) {
      redis.delete(tokenKey(oldToken));
    }

    redis.opsForValue().set(tokenKey, String.valueOf(userId), TTL);
    redis.opsForValue().set(userKey, token, TTL);
    return token;
  }

  public Long getUserIdByToken(String token) {
    if (token == null || token.isBlank()) return null;
    String v = redis.opsForValue().get(tokenKey(token));
    if (v == null || v.isBlank()) return null;
    try {
      return Long.parseLong(v);
    } catch (NumberFormatException e) {
      return null;
    }
  }

  public void revoke(Long userId) {
    if (userId == null) return;
    String userKey = userKey(userId);
    String token = redis.opsForValue().get(userKey);
    if (token != null && !token.isBlank()) {
      redis.delete(tokenKey(token));
    }
    redis.delete(userKey);
  }

  private static String tokenKey(String token) {
    return "sess:token:" + token;
  }

  private static String userKey(Long userId) {
    return "sess:user:" + userId;
  }
}

