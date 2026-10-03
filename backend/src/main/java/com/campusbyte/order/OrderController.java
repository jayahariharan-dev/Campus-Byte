package com.campusbyte.order;

import com.campusbyte.cart.CartItem;
import com.campusbyte.cart.CartItemRepository;
import com.campusbyte.model.User;
import com.campusbyte.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import com.campusbyte.menu.DailyMenu;
import com.campusbyte.menu.DailyMenuRepository;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

        private final OrderRepository orderRepository;
        private final OrderItemRepository orderItemRepository;
        private final CartItemRepository cartRepository;
        private final UserRepository userRepository;
        private final DailyMenuRepository dailyMenuRepository;

        public OrderController(
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartItemRepository cartRepository,
                        UserRepository userRepository,
                        DailyMenuRepository dailyMenuRepository) {

                this.orderRepository = orderRepository;
                this.orderItemRepository = orderItemRepository;
                this.cartRepository = cartRepository;
                this.userRepository = userRepository;
                this.dailyMenuRepository = dailyMenuRepository;
        }

        // =========================
        // CHECKOUT
        // =========================

        @Transactional
        @PostMapping("/checkout")
        public Map<String, Object> checkout(
                        @RequestParam String studentEmail,
                        @RequestParam String paymentMethod) {

                User student = getStudent(studentEmail);

                List<CartItem> cart = cartRepository.findByStudentOrderByIdAsc(student);

                if (cart.isEmpty()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Your cart is empty.");
                }

                // =========================
                // CHECK FOOD STOCK
                // =========================

                for (CartItem cartItem : cart) {

                        DailyMenu menu = cartItem.getDailyMenu();

                        Integer stock = menu.getAvailableQuantity();

                        // Null means unlimited stock
                        if (stock != null) {

                                if (stock <= 0 || cartItem.getQuantity() > stock) {

                                        throw new ResponseStatusException(
                                                        HttpStatus.BAD_REQUEST,
                                                        menu.getFoodItem().getName()
                                                                        + " is out of stock or has insufficient quantity.");
                                }
                        }
                }

                if (!paymentMethod.equals("ONLINE")
                                && !paymentMethod.equals("CASH")) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Invalid payment method.");
                }

                BigDecimal total = BigDecimal.ZERO;

                for (CartItem cartItem : cart) {

                        BigDecimal itemTotal = cartItem.getPrice()
                                        .multiply(
                                                        BigDecimal.valueOf(
                                                                        cartItem.getQuantity()));

                        total = total.add(itemTotal);
                }

                Order order = new Order();

                order.setOrderCode(
                                "CB" + System.currentTimeMillis());

                order.setQrToken(
                                UUID.randomUUID().toString());

                order.setQrActive(true);

                order.setStudent(student);
                order.setTotalAmount(total);
                order.setPaymentMethod(paymentMethod);
                order.setStatus("PLACED");
                order.setOrderTime(LocalDateTime.now());

                orderRepository.save(order);

                for (CartItem cartItem : cart) {

                        DailyMenu menu = cartItem.getDailyMenu();

                        // =========================
                        // REDUCE FOOD STOCK
                        // =========================

                        Integer stock = menu.getAvailableQuantity();

                        if (stock != null) {

                                int remainingStock = stock - cartItem.getQuantity();

                                menu.setAvailableQuantity(remainingStock);

                                // Automatically disable when sold out
                                if (remainingStock <= 0) {
                                        menu.setAvailable(false);
                                }

                                dailyMenuRepository.save(menu);
                        }

                        // =========================
                        // CREATE ORDER ITEM
                        // =========================

                        OrderItem orderItem = new OrderItem();

                        orderItem.setOrder(order);

                        orderItem.setDailyMenu(menu);

                        orderItem.setFoodName(
                                        menu.getFoodItem().getName());

                        orderItem.setQuantity(
                                        cartItem.getQuantity());

                        orderItem.setPrice(
                                        cartItem.getPrice());

                        orderItemRepository.save(orderItem);
                }

                cartRepository.deleteAll(cart);

                return Map.of(
                                "message", "Order placed successfully.",
                                "orderId", order.getId(),
                                "orderCode", order.getOrderCode(),
                                "totalAmount", order.getTotalAmount(),
                                "paymentMethod", order.getPaymentMethod(),
                                "status", order.getStatus(),
                                "qrToken", order.getQrToken(),
                                "qrActive", order.isQrActive());
        }

        // =========================
        // MY ORDERS
        // =========================

        @GetMapping
        public List<Map<String, Object>> getMyOrders(
                        @RequestParam String studentEmail) {

                User student = getStudent(studentEmail);

                List<Order> orders = orderRepository
                                .findByStudentOrderByIdDesc(student);

                List<Map<String, Object>> result = new ArrayList<>();

                for (Order order : orders) {

                        Map<String, Object> orderData = new LinkedHashMap<>();

                        orderData.put(
                                        "id",
                                        order.getId());

                        orderData.put(
                                        "orderCode",
                                        order.getOrderCode());

                        orderData.put(
                                        "totalAmount",
                                        order.getTotalAmount());

                        orderData.put(
                                        "paymentMethod",
                                        order.getPaymentMethod());

                        orderData.put(
                                        "status",
                                        order.getStatus());

                        orderData.put(
                                        "orderTime",
                                        order.getOrderTime());

                        orderData.put(
                                        "qrToken",
                                        order.getQrToken());

                        orderData.put(
                                        "qrActive",
                                        order.isQrActive());

                        List<OrderItem> items = orderItemRepository
                                        .findByOrderOrderByIdAsc(order);

                        List<Map<String, Object>> itemList = new ArrayList<>();

                        for (OrderItem orderItem : items) {

                                Map<String, Object> item = new LinkedHashMap<>();

                                item.put(
                                                "foodName",
                                                orderItem.getFoodName());

                                item.put(
                                                "quantity",
                                                orderItem.getQuantity());

                                item.put(
                                                "price",
                                                orderItem.getPrice());

                                itemList.add(item);
                        }

                        orderData.put(
                                        "items",
                                        itemList);

                        result.add(orderData);
                }

                return result;
        }

        // =========================
        // OWNER - ALL ORDERS
        // =========================

        @GetMapping("/owner")
        public List<Map<String, Object>> getOwnerOrders() {

                List<Order> orders = orderRepository.findAllByOrderByIdDesc();

                List<Map<String, Object>> result = new ArrayList<>();

                for (Order order : orders) {

                        Map<String, Object> data = new LinkedHashMap<>();

                        data.put("id", order.getId());
                        data.put("orderCode", order.getOrderCode());
                        data.put("totalAmount", order.getTotalAmount());
                        data.put("paymentMethod", order.getPaymentMethod());
                        data.put("status", order.getStatus());
                        data.put("orderTime", order.getOrderTime());
                        data.put("qrToken", order.getQrToken());
                        data.put("qrActive", order.isQrActive());

                        if (order.getStudent() != null) {
                                data.put(
                                                "studentName",
                                                order.getStudent().getName());

                                data.put(
                                                "studentEmail",
                                                order.getStudent().getEmail());
                        }

                        List<OrderItem> items = orderItemRepository
                                        .findByOrderOrderByIdAsc(order);

                        List<Map<String, Object>> itemList = new ArrayList<>();

                        for (OrderItem orderItem : items) {

                                Map<String, Object> item = new LinkedHashMap<>();

                                item.put(
                                                "foodName",
                                                orderItem.getFoodName());

                                item.put(
                                                "quantity",
                                                orderItem.getQuantity());

                                item.put(
                                                "price",
                                                orderItem.getPrice());

                                itemList.add(item);
                        }

                        data.put("items", itemList);

                        result.add(data);
                }

                return result;
        }

        // =========================
        // FIND STUDENT
        // =========================

        private User getStudent(String email) {

                User user = userRepository
                                .findByEmailIgnoreCase(email)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Student not found."));

                if (user.getRole() != com.campusbyte.model.Role.STUDENT) {

                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "Only students can access orders.");
                }

                return user;
        }
}