package com.qqcg.server.controller;

import com.qqcg.server.dto.OrderDtos;
import com.qqcg.server.entity.DishEntity;
import com.qqcg.server.entity.OrderEntity;
import com.qqcg.server.entity.OrderItemEntity;
import com.qqcg.server.entity.RestaurantEntity;
import com.qqcg.server.repo.DishRepository;
import com.qqcg.server.repo.OrderItemRepository;
import com.qqcg.server.repo.OrderRepository;
import com.qqcg.server.repo.RestaurantRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final DishRepository dishRepository;
  private final RestaurantRepository restaurantRepository;

  public OrderController(
    OrderRepository orderRepository,
    OrderItemRepository orderItemRepository,
    DishRepository dishRepository,
    RestaurantRepository restaurantRepository
  ) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.dishRepository = dishRepository;
    this.restaurantRepository = restaurantRepository;
  }

  @PostMapping("/submit")
  public OrderDtos.OrderResp submit(@Valid @RequestBody OrderDtos.SubmitOrderReq req) {
    RestaurantEntity restaurant = restaurantRepository.findById(req.getRestaurantId()).orElseThrow();

    List<Long> dishIds = req.getItems().stream().map(OrderDtos.Item::getDishId).toList();
    Map<Long, DishEntity> dishMap = dishRepository.findAllById(dishIds).stream()
      .collect(Collectors.toMap(DishEntity::getId, Function.identity()));

    BigDecimal totalAmount = BigDecimal.ZERO;
    int totalCount = 0;

    List<OrderItemEntity> orderItems = new ArrayList<>();
    for (OrderDtos.Item it : req.getItems()) {
      DishEntity dish = dishMap.get(it.getDishId());
      if (dish == null) throw new IllegalArgumentException("dish not found: " + it.getDishId());
      if (!Objects.equals(dish.getRestaurantId(), req.getRestaurantId())) {
        throw new IllegalArgumentException("dish not in restaurant: " + it.getDishId());
      }
      int qty = it.getQuantity();
      totalCount += qty;
      BigDecimal line = dish.getPrice().multiply(BigDecimal.valueOf(qty));
      totalAmount = totalAmount.add(line);

      OrderItemEntity oi = new OrderItemEntity();
      oi.setDishId(dish.getId());
      oi.setDishName(dish.getName());
      oi.setPrice(dish.getPrice());
      oi.setQuantity(qty);
      orderItems.add(oi);
    }

    OrderEntity order = new OrderEntity();
    order.setUserId(req.getUserId());
    order.setRestaurantId(req.getRestaurantId());
    order.setTotalCount(totalCount);
    order.setTotalAmount(totalAmount);
    order.setStatus((byte) 0);
    order = orderRepository.save(order);

    Long orderId = order.getId();
    for (OrderItemEntity oi : orderItems) {
      oi.setOrderId(orderId);
    }
    orderItemRepository.saveAll(orderItems);

    return toOrderResp(order, restaurant.getName(), orderItems);
  }

  @GetMapping("/by-day")
  public OrderDtos.OrdersByDayResp byDay(
    @RequestParam("userId") Long userId,
    @RequestParam(value = "restaurantId", required = false) Long restaurantId,
    @RequestParam(value = "days", required = false, defaultValue = "14") int days
  ) {
    List<OrderEntity> orders;
    if (restaurantId != null) {
      orders = orderRepository.findByUserIdAndRestaurantIdOrderByCreatedAtDesc(userId, restaurantId);
    } else {
      orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // only keep last N days (cheap filter)
    LocalDate cutoff = LocalDate.now().minusDays(Math.max(1, Math.min(days, 365)));
    orders = orders.stream()
      .filter(o -> o.getCreatedAt() == null || !o.getCreatedAt().toLocalDate().isBefore(cutoff))
      .toList();

    List<Long> orderIds = orders.stream().map(OrderEntity::getId).toList();
    Map<Long, List<OrderItemEntity>> itemsByOrderId = orderIds.isEmpty()
      ? Map.of()
      : orderItemRepository.findByOrderIdIn(orderIds).stream()
      .collect(Collectors.groupingBy(OrderItemEntity::getOrderId));

    Map<Long, String> restaurantNameMap = restaurantRepository.findAllById(
      orders.stream().map(OrderEntity::getRestaurantId).distinct().toList()
    ).stream().collect(Collectors.toMap(RestaurantEntity::getId, RestaurantEntity::getName));

    Map<String, List<OrderDtos.OrderResp>> grouped = new LinkedHashMap<>();
    for (OrderEntity o : orders) {
      String day = (o.getCreatedAt() == null ? LocalDateTime.now() : o.getCreatedAt()).toLocalDate().toString();
      String rn = restaurantNameMap.getOrDefault(o.getRestaurantId(), "");
      List<OrderItemEntity> its = itemsByOrderId.getOrDefault(o.getId(), List.of());
      grouped.computeIfAbsent(day, k -> new ArrayList<>()).add(toOrderResp(o, rn, its));
    }

    OrderDtos.OrdersByDayResp resp = new OrderDtos.OrdersByDayResp();
    resp.setDays(grouped);
    return resp;
  }

  private OrderDtos.OrderResp toOrderResp(OrderEntity o, String restaurantName, List<OrderItemEntity> items) {
    OrderDtos.OrderResp r = new OrderDtos.OrderResp();
    r.setId(o.getId());
    r.setRestaurantId(o.getRestaurantId());
    r.setRestaurantName(restaurantName);
    r.setTotalAmount(o.getTotalAmount());
    r.setTotalCount(o.getTotalCount());
    r.setCreatedAt(o.getCreatedAt());
    r.setItems(items.stream().map(this::toItemResp).toList());
    return r;
  }

  private OrderDtos.OrderItemResp toItemResp(OrderItemEntity it) {
    OrderDtos.OrderItemResp r = new OrderDtos.OrderItemResp();
    r.setDishId(it.getDishId());
    r.setName(it.getDishName());
    r.setPrice(it.getPrice());
    r.setQuantity(it.getQuantity());
    r.setLineTotal(it.getPrice().multiply(BigDecimal.valueOf(it.getQuantity())));
    return r;
  }
}

