package com.qqcg.server.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "dish")
public class DishEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "restaurant_id", nullable = false)
  private Long restaurantId;

  @Column(name = "name", nullable = false, length = 64)
  private String name;

  @Column(name = "price", nullable = false, precision = 8, scale = 2)
  private BigDecimal price;

  @Column(name = "pic_url", length = 255)
  private String picUrl;

  @Column(name = "category", length = 32)
  private String category;

  @Column(name = "online")
  private Byte online;

  @Column(name = "created_at", insertable = false, updatable = false)
  private LocalDateTime createdAt;
}

