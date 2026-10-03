package com.campusbyte.cart;

import jakarta.validation.constraints.Min;

public class CartRequest {

    private Long dailyMenuId;

    @Min(1)
    private Integer quantity = 1;

    public Long getDailyMenuId() {
        return dailyMenuId;
    }

    public void setDailyMenuId(Long dailyMenuId) {
        this.dailyMenuId = dailyMenuId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}