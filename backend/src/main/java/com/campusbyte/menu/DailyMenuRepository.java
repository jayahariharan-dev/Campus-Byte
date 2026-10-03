package com.campusbyte.menu;

import com.campusbyte.canteen.Canteen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyMenuRepository extends JpaRepository<DailyMenu, Long> {

    List<DailyMenu> findByMenuDateAndAvailableTrueOrderByIdAsc(LocalDate date);

    List<DailyMenu> findByCanteenAndMenuDateOrderByIdAsc(
            Canteen canteen,
            LocalDate date
    );

    Optional<DailyMenu> findByFoodItemIdAndMenuDate(
            Long foodItemId,
            LocalDate date
    );
}