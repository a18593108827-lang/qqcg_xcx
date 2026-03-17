package com.qqcg.server.controller;

import com.qqcg.server.dto.DishDtos;
import com.qqcg.server.entity.DishEntity;
import com.qqcg.server.repo.DishRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/dishes")
public class DishController {
  private final DishRepository dishRepository;

  public DishController(DishRepository dishRepository) {
    this.dishRepository = dishRepository;
  }

  @GetMapping
  public List<DishDtos.DishResp> list(@RequestParam("restaurantId") Long restaurantId) {
    seedIfEmpty(restaurantId);
    return dishRepository.findByRestaurantIdAndOnlineOrderByIdAsc(restaurantId, (byte) 1).stream()
      .map(this::toResp)
      .toList();
  }

  private void seedIfEmpty(Long restaurantId) {
    if (dishRepository.countByRestaurantId(restaurantId) > 0) return;
    dishRepository.saveAll(List.of(
      dish(restaurantId, "招牌牛肉面", new BigDecimal("18.00"), "主食"),
      dish(restaurantId, "番茄鸡蛋面", new BigDecimal("15.00"), "主食"),
      dish(restaurantId, "炸鸡翅（4只）", new BigDecimal("16.00"), "小吃"),
      dish(restaurantId, "薯条", new BigDecimal("10.00"), "小吃"),
      dish(restaurantId, "可乐", new BigDecimal("6.00"), "饮品"),
      dish(restaurantId, "柠檬茶", new BigDecimal("8.00"), "饮品")
    ));
  }

  private DishEntity dish(Long restaurantId, String name, BigDecimal price, String category) {
    DishEntity d = new DishEntity();
    d.setRestaurantId(restaurantId);
    d.setName(name);
    d.setPrice(price);
    d.setCategory(category);
    d.setOnline((byte) 1);
    return d;
  }

  private DishDtos.DishResp toResp(DishEntity d) {
    DishDtos.DishResp r = new DishDtos.DishResp();
    r.setId(d.getId());
    r.setRestaurantId(d.getRestaurantId());
    r.setName(d.getName());
    r.setPrice(d.getPrice());
    r.setPicUrl(d.getPicUrl());
    r.setCategory(d.getCategory());
    return r;
  }
}

