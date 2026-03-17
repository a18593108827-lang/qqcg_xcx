package com.qqcg.server.repo;

import com.qqcg.server.entity.DishEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DishRepository extends JpaRepository<DishEntity, Long> {
  List<DishEntity> findByRestaurantIdAndOnlineOrderByIdAsc(Long restaurantId, Byte online);
  long countByRestaurantId(Long restaurantId);
}

