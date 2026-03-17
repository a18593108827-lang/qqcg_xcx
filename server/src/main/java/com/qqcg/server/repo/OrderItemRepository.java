package com.qqcg.server.repo;

import com.qqcg.server.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
  List<OrderItemEntity> findByOrderId(Long orderId);
  List<OrderItemEntity> findByOrderIdIn(List<Long> orderIds);
}

