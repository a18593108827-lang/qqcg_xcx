package com.qqcg.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class RestaurantDtos {
  @Data
  public static class BindOrCreateReq {
    @NotNull
    private Long userId;
    @NotBlank
    private String name;
    private String address;
  }

  @Data
  public static class RestaurantResp {
    private Long id;
    private String name;
    private String address;
  }
}

