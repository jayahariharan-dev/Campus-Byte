package com.campusbyte.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalTime;

public class MenuRequest {

    @NotNull
    private Long foodItemId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal price;

    private boolean available = true;

    @Min(0)
    private Integer availableQuantity;

    private LocalTime orderingDeadline;
    private LocalTime pickupStart;
    private LocalTime pickupEnd;

    public Long getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public LocalTime getOrderingDeadline() {
        return orderingDeadline;
    }

    public void setOrderingDeadline(LocalTime orderingDeadline) {
        this.orderingDeadline = orderingDeadline;
    }

    public LocalTime getPickupStart() {
        return pickupStart;
    }

    public void setPickupStart(LocalTime pickupStart) {
        this.pickupStart = pickupStart;
    }

    public LocalTime getPickupEnd() {
        return pickupEnd;
    }

    public void setPickupEnd(LocalTime pickupEnd) {
        this.pickupEnd = pickupEnd;
    }
}