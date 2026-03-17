package com.qqcg.server.repo;

import com.qqcg.server.entity.UserRestaurantBindEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRestaurantBindRepository extends JpaRepository<UserRestaurantBindEntity, Long> {
  Optional<UserRestaurantBindEntity> findTopByUserIdOrderByBoundAtDesc(Long userId);
  Optional<UserRestaurantBindEntity> findByUserIdAndRestaurantId(Long userId, Long restaurantId);

  long deleteByUserId(Long userId);
}

