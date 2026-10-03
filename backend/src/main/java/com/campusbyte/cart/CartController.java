package com.campusbyte.cart;

import com.campusbyte.menu.DailyMenu;
import com.campusbyte.menu.DailyMenuRepository;
import com.campusbyte.model.User;
import com.campusbyte.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartItemRepository cartRepository;
    private final DailyMenuRepository menuRepository;
    private final UserRepository userRepository;

    public CartController(
            CartItemRepository cartRepository,
            DailyMenuRepository menuRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.menuRepository = menuRepository;
        this.userRepository = userRepository;
    }


    // =========================
    // GET CART
    // =========================

    @GetMapping
    public List<Map<String, Object>> getCart(
            @RequestParam String studentEmail) {

        User student = getStudent(studentEmail);

        List<Map<String, Object>> result = new ArrayList<>();

        for (CartItem cartItem :
                cartRepository.findByStudentOrderByIdAsc(student)) {

            DailyMenu menu = cartItem.getDailyMenu();

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("id", cartItem.getId());
            item.put("dailyMenuId", menu.getId());
            item.put("name", menu.getFoodItem().getName());
            item.put("description", menu.getFoodItem().getDescription());
            item.put("category", menu.getFoodItem().getCategory());
            item.put("price", cartItem.getPrice());
            item.put("quantity", cartItem.getQuantity());
            item.put(
                    "subtotal",
                    cartItem.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(cartItem.getQuantity())
                            )
            );

            result.add(item);
        }

        return result;
    }


    // =========================
    // ADD TO CART
    // =========================

    @PostMapping
    public Map<String, Object> addToCart(
            @RequestParam String studentEmail,
            @Valid @RequestBody CartRequest request) {

        User student = getStudent(studentEmail);

        DailyMenu menu = menuRepository.findById(request.getDailyMenuId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Menu item not found."
                        )
                );

        if (!menu.getMenuDate().equals(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This food item is not available today."
            );
        }

        if (!menu.isAvailable()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This food item is currently unavailable."
            );
        }

        int requestedQuantity = request.getQuantity();

        if (menu.getAvailableQuantity() != null &&
                requestedQuantity > menu.getAvailableQuantity()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Not enough quantity available."
            );
        }

        CartItem cartItem =
                cartRepository
                        .findByStudentIdAndDailyMenuId(
                                student.getId(),
                                menu.getId()
                        )
                        .orElseGet(CartItem::new);

        int newQuantity =
                cartItem.getId() == null
                        ? requestedQuantity
                        : cartItem.getQuantity() + requestedQuantity;

        if (menu.getAvailableQuantity() != null &&
                newQuantity > menu.getAvailableQuantity()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Not enough quantity available."
            );
        }

        cartItem.setStudent(student);
        cartItem.setDailyMenu(menu);
        cartItem.setQuantity(newQuantity);
        cartItem.setPrice(menu.getPrice());

        cartRepository.save(cartItem);

        return Map.of(
                "message", "Item added to cart.",
                "quantity", newQuantity
        );
    }


    // =========================
    // UPDATE QUANTITY
    // =========================

    @PutMapping("/{cartItemId}")
    public Map<String, Object> updateQuantity(
            @RequestParam String studentEmail,
            @PathVariable Long cartItemId,
            @Valid @RequestBody CartRequest request) {

        User student = getStudent(studentEmail);

        CartItem cartItem =
                cartRepository.findByIdAndStudent(
                        cartItemId,
                        student
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cart item not found."
                        )
                );

        DailyMenu menu = cartItem.getDailyMenu();

        if (menu.getAvailableQuantity() != null &&
                request.getQuantity() > menu.getAvailableQuantity()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Not enough quantity available."
            );
        }

        cartItem.setQuantity(request.getQuantity());

        cartRepository.save(cartItem);

        return Map.of(
                "message", "Cart updated.",
                "quantity", cartItem.getQuantity()
        );
    }


    // =========================
    // REMOVE FROM CART
    // =========================

    @DeleteMapping("/{cartItemId}")
    public Map<String, String> removeFromCart(
            @RequestParam String studentEmail,
            @PathVariable Long cartItemId) {

        User student = getStudent(studentEmail);

        CartItem cartItem =
                cartRepository.findByIdAndStudent(
                        cartItemId,
                        student
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cart item not found."
                        )
                );

        cartRepository.delete(cartItem);

        return Map.of(
                "message",
                "Item removed from cart."
        );
    }


    // =========================
    // FIND STUDENT
    // =========================

    private User getStudent(String email) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Student not found."
                        )
                );

        if (user.getRole() != com.campusbyte.model.Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can use the cart."
            );
        }

        return user;
    }
}