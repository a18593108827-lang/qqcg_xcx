package com.qqcg.server.controller;

import com.qqcg.server.dto.RestaurantDtos;
import com.qqcg.server.entity.RestaurantEntity;
import com.qqcg.server.entity.UserRestaurantBindEntity;
import com.qqcg.server.repo.RestaurantRepository;
import com.qqcg.server.repo.UserRestaurantBindRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
  private final RestaurantRepository restaurantRepository;
  private final UserRestaurantBindRepository bindRepository;

  public RestaurantController(RestaurantRepository restaurantRepository, UserRestaurantBindRepository bindRepository) {
    this.restaurantRepository = restaurantRepository;
    this.bindRepository = bindRepository;
  }

  @GetMapping("/current")
  public RestaurantDtos.RestaurantResp current(@RequestParam("userId") Long userId) {
    return bindRepository.findTopByUserIdOrderByBoundAtDesc(userId)
      .flatMap(b -> restaurantRepository.findById(b.getRestaurantId()))
      .map(this::toResp)
      .orElse(null);
  }

  @PostMapping("/bindOrCreate")
  public RestaurantDtos.RestaurantResp bindOrCreate(@Valid @RequestBody RestaurantDtos.BindOrCreateReq req) {
    RestaurantEntity r = new RestaurantEntity();
    r.setName(req.getName());
    r.setAddress(req.getAddress());
    r.setCreatedBy(req.getUserId());
    r = restaurantRepository.save(r);

    UserRestaurantBindEntity bind = new UserRestaurantBindEntity();
    bind.setUserId(req.getUserId());
    bind.setRestaurantId(r.getId());
    bindRepository.save(bind);

    return toResp(r);
  }

  private RestaurantDtos.RestaurantResp toResp(RestaurantEntity r) {
    RestaurantDtos.RestaurantResp resp = new RestaurantDtos.RestaurantResp();
    resp.setId(r.getId());
    resp.setName(r.getName());
    resp.setAddress(r.getAddress());
    return resp;
  }
}

