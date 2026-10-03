package com.campusbyte.menu;

import com.campusbyte.canteen.Canteen;
import com.campusbyte.canteen.CanteenRepository;
import com.campusbyte.model.User;
import com.campusbyte.repository.UserRepository;
import com.campusbyte.repository.FoodItemRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final DailyMenuRepository menuRepository;
    private final FoodItemRepository foodRepository;
    private final CanteenRepository canteenRepository;
    private final UserRepository userRepository;

    public MenuController(
            DailyMenuRepository menuRepository,
            FoodItemRepository foodRepository,
            CanteenRepository canteenRepository,
            UserRepository userRepository) {

        this.menuRepository = menuRepository;
        this.foodRepository = foodRepository;
        this.canteenRepository = canteenRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/today")
    public List<Map<String, Object>> getTodayMenu() {

        List<Map<String, Object>> result = new ArrayList<>();

        for (DailyMenu menu :
                menuRepository.findByMenuDateAndAvailableTrueOrderByIdAsc(
                        LocalDate.now())) {

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("id", menu.getId());
            item.put("foodItemId", menu.getFoodItem().getId());
            item.put("name", menu.getFoodItem().getName());
            item.put("description", menu.getFoodItem().getDescription());
            item.put("category", menu.getFoodItem().getCategory());
            item.put("price", menu.getPrice());
            item.put("availableQuantity", menu.getAvailableQuantity());
            item.put("orderingDeadline", menu.getOrderingDeadline());
            item.put("pickupStart", menu.getPickupStart());
            item.put("pickupEnd", menu.getPickupEnd());

            result.add(item);
        }

        return result;
    }

    @GetMapping("/food")
    public List<FoodItem> getFoodItems(
            @RequestParam String ownerEmail) {

        return foodRepository.findByCanteenAndActiveTrue(
                getCanteen(ownerEmail)
        );
    }

    @PostMapping("/food")
    public FoodItem addFood(
            @RequestParam String ownerEmail,
            @Valid @RequestBody FoodRequest request) {

        FoodItem food = new FoodItem();

        food.setName(request.getName().trim());
        food.setDescription(request.getDescription());
        food.setCategory(request.getCategory());
        food.setCanteen(getCanteen(ownerEmail));

        return foodRepository.save(food);
    }

    @PostMapping("/today")
    public DailyMenu publishToday(
            @RequestParam String ownerEmail,
            @Valid @RequestBody MenuRequest request) {

        Canteen canteen = getCanteen(ownerEmail);

        FoodItem food = foodRepository.findById(request.getFoodItemId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Food item not found."
                        ));

        if (!food.getCanteen().getId().equals(canteen.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Food item does not belong to your canteen."
            );
        }

        DailyMenu menu =
                menuRepository
                        .findByFoodItemIdAndMenuDate(
                                food.getId(),
                                LocalDate.now()
                        )
                        .orElseGet(DailyMenu::new);

        menu.setFoodItem(food);
        menu.setCanteen(canteen);
        menu.setMenuDate(LocalDate.now());
        menu.setPrice(request.getPrice());
        menu.setAvailable(request.isAvailable());
        menu.setAvailableQuantity(request.getAvailableQuantity());
        menu.setOrderingDeadline(request.getOrderingDeadline());
        menu.setPickupStart(request.getPickupStart());
        menu.setPickupEnd(request.getPickupEnd());

        return menuRepository.save(menu);
    }

    @GetMapping("/today/manage")
    public List<DailyMenu> manageToday(
            @RequestParam String ownerEmail) {

        return menuRepository.findByCanteenAndMenuDateOrderByIdAsc(
                getCanteen(ownerEmail),
                LocalDate.now()
        );
    }

    private Canteen getCanteen(String email) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found."
                        ));

        return canteenRepository
                .findByOwner(user)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Canteen not found."
                        ));
    }
}