package com.qqcg.server.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class OrderDtos {
  @Data
  public static class SubmitOrderReq {
    @NotNull
    private Long userId;
    @NotNull
    private Long restaurantId;

    @NotEmpty
    @Valid
    private List<Item> items;
  }

  @Data
  public static class Item {
    @NotNull
    private Long dishId;
    @Min(1)
    private Integer quantity;
  }

  @Data
  public static class OrderItemResp {
    private Long dishId;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal lineTotal;
  }

  @Data
  public static class OrderResp {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private BigDecimal totalAmount;
    private Integer totalCount;
    private LocalDateTime createdAt;
    private List<OrderItemResp> items;
  }

  @Data
  public static class OrdersByDayResp {
    private Map<String, List<OrderResp>> days;
  }
}

