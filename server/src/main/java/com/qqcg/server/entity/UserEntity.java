package com.qqcg.server.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user")
public class UserEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "open_id", nullable = false, unique = true, length = 64)
  private String openId;

  @Column(name = "nickname", length = 64)
  private String nickname;

  @Column(name = "avatar_url", length = 255)
  private String avatarUrl;

  @Column(name = "created_at", insertable = false, updatable = false)
  private LocalDateTime createdAt;
}

