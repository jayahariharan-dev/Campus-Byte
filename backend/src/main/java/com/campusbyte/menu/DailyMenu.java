package com.campusbyte.menu;

import com.campusbyte.canteen.Canteen;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
    name = "daily_menu",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"food_item_id", "menu_date"}
    )
)
public class DailyMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "food_item_id")
    private FoodItem foodItem;

    @ManyToOne(optional = false)
    @JoinColumn(name = "canteen_id")
    private Canteen canteen;

    @Column(name = "menu_date", nullable = false)
    private LocalDate menuDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean available = true;

    private Integer availableQuantity;

    private LocalTime orderingDeadline;
    private LocalTime pickupStart;
    private LocalTime pickupEnd;

    public DailyMenu() {}

    public Long getId() {
        return id;
    }

    public FoodItem getFoodItem() {
        return foodItem;
    }

    public void setFoodItem(FoodItem foodItem) {
        this.foodItem = foodItem;
    }

    public Canteen getCanteen() {
        return canteen;
    }

    public void setCanteen(Canteen canteen) {
        this.canteen = canteen;
    }

    public LocalDate getMenuDate() {
        return menuDate;
    }

    public void setMenuDate(LocalDate menuDate) {
        this.menuDate = menuDate;
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