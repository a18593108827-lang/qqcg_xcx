package com.qqcg.server.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "order_item")
public class OrderItemEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "order_id", nullable = false)
  private Long orderId;

  @Column(name = "dish_id", nullable = false)
  private Long dishId;

  @Column(name = "dish_name", nullable = false, length = 64)
  private String dishName;

  @Column(name = "price", nullable = false, precision = 8, scale = 2)
  private BigDecimal price;

  @Column(name = "quantity", nullable = false)
  private Integer quantity;
}

