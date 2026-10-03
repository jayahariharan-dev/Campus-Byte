package com.campusbyte.repository;

import com.campusbyte.menu.FoodItem;
import com.campusbyte.canteen.Canteen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByCanteenAndActiveTrue(Canteen canteen);
}