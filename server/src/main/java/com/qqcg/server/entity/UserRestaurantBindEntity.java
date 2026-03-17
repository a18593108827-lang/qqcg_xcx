package com.qqcg.server.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_restaurant_bind",
  uniqueConstraints = @UniqueConstraint(name = "uk_user_rest", columnNames = {"user_id", "restaurant_id"}))
public class UserRestaurantBindEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "restaurant_id", nullable = false)
  private Long restaurantId;

  @Column(name = "bound_at", insertable = false, updatable = false)
  private LocalDateTime boundAt;
}

