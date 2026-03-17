package com.qqcg.server.config;

import com.qqcg.server.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
  private final SessionService sessionService;

  public AuthInterceptor(SessionService sessionService) {
    this.sessionService = sessionService;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    String path = request.getRequestURI();
    if (path.startsWith("/api/health")) {
      return true;
    }
    // allow login endpoints without token
    if (path.startsWith("/api/auth/") && !path.equals("/api/auth/logout")) {
      return true;
    }

    String token = request.getHeader("X-Token");
    if (token == null || token.isBlank()) {
      String auth = request.getHeader("Authorization");
      if (auth != null && auth.toLowerCase().startsWith("bearer ")) {
        token = auth.substring(7).trim();
      }
    }

    Long userId = sessionService.getUserIdByToken(token);
    if (userId == null) {
      response.setStatus(401);
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write("{\"error\":\"unauthorized\"}");
      return false;
    }
    request.setAttribute("userId", userId);
    return true;
  }
}

