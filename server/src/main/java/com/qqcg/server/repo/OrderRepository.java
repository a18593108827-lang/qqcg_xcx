package com.qqcg.server.repo;

import com.qqcg.server.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
  List<OrderEntity> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, LocalDateTime start, LocalDateTime end);
  List<OrderEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
  List<OrderEntity> findByUserIdAndRestaurantIdOrderByCreatedAtDesc(Long userId, Long restaurantId);
}

