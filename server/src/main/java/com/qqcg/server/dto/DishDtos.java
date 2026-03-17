package com.qqcg.server.dto;

import lombok.Data;

import java.math.BigDecimal;

public class DishDtos {
  @Data
  public static class DishResp {
    private Long id;
    private Long restaurantId;
    private String name;
    private BigDecimal price;
    private String picUrl;
    private String category;
  }
}

