package com.campusbyte.order;

import com.campusbyte.canteen.Canteen;
import com.campusbyte.canteen.CanteenRepository;
import com.campusbyte.model.User;
import com.campusbyte.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/owner/orders")
public class OwnerOrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final CanteenRepository canteenRepository;

    public OwnerOrderController(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository,
            CanteenRepository canteenRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.canteenRepository = canteenRepository;
    }


    // =========================
    // GET OWNER ORDERS
    // =========================

    @GetMapping
    public List<Map<String, Object>> getOwnerOrders(
            @RequestParam String ownerEmail) {

        User owner = getOwner(ownerEmail);

        Canteen canteen =
                canteenRepository.findByOwner(owner)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Canteen not found."
                                )
                        );

        List<Order> orders =
                orderRepository.findAll();

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Order order : orders) {

            List<OrderItem> orderItems =
                    orderItemRepository
                            .findByOrderOrderByIdAsc(order);

            boolean belongsToCanteen = false;

            for (OrderItem item : orderItems) {

                if (item.getDailyMenu()
                        .getCanteen()
                        .getId()
                        .equals(canteen.getId())) {

                    belongsToCanteen = true;
                    break;
                }
            }

            if (!belongsToCanteen) {
                continue;
            }

            Map<String, Object> orderData =
                    new LinkedHashMap<>();

            orderData.put("id", order.getId());
            orderData.put("orderCode", order.getOrderCode());
            orderData.put(
                    "studentName",
                    order.getStudent().getName()
            );
            orderData.put(
                    "studentEmail",
                    order.getStudent().getEmail()
            );
            orderData.put(
                    "totalAmount",
                    order.getTotalAmount()
            );
            orderData.put(
                    "paymentMethod",
                    order.getPaymentMethod()
            );
            orderData.put(
                    "status",
                    order.getStatus()
            );
            orderData.put(
                    "orderTime",
                    order.getOrderTime()
            );

            List<Map<String, Object>> itemList =
                    new ArrayList<>();

            for (OrderItem orderItem : orderItems) {

                Map<String, Object> item =
                        new LinkedHashMap<>();

                item.put(
                        "foodName",
                        orderItem.getFoodName()
                );

                item.put(
                        "quantity",
                        orderItem.getQuantity()
                );

                item.put(
                        "price",
                        orderItem.getPrice()
                );

                itemList.add(item);
            }

            orderData.put("items", itemList);

            result.add(orderData);
        }

        return result;
    }


    // =========================
    // VERIFY PICKUP QR
    // =========================

    @PostMapping("/verify-qr")
    public Map<String, Object> verifyQr(
            @RequestParam String ownerEmail,
            @RequestBody Map<String, String> request) {

        User owner = getOwner(ownerEmail);

        Canteen canteen =
                canteenRepository.findByOwner(owner)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Canteen not found."
                                )
                        );

        String qrToken = request.get("qrToken");

        if (qrToken == null || qrToken.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "QR token is missing."
            );
        }

        Order order =
                orderRepository
                        .findByQrToken(qrToken)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Invalid QR code."
                                )
                        );


        // QR can only be used once
        if (!order.isQrActive()) {

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This QR code has already been used."
            );
        }


        // Order must not already be completed
        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This order has already been completed."
            );
        }


        // Verify that this order belongs to this owner's canteen
        List<OrderItem> orderItems =
                orderItemRepository
                        .findByOrderOrderByIdAsc(order);

        boolean belongsToCanteen = false;

        for (OrderItem item : orderItems) {

            if (item.getDailyMenu()
                    .getCanteen()
                    .getId()
                    .equals(canteen.getId())) {

                belongsToCanteen = true;
                break;
            }
        }


        if (!belongsToCanteen) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This order does not belong to your canteen."
            );
        }


        // Return verified order information
        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("id", order.getId());
        result.put("orderCode", order.getOrderCode());
        result.put(
                "studentName",
                order.getStudent().getName()
        );
        result.put(
                "studentEmail",
                order.getStudent().getEmail()
        );
        result.put(
                "totalAmount",
                order.getTotalAmount()
        );
        result.put(
                "paymentMethod",
                order.getPaymentMethod()
        );
        result.put(
                "status",
                order.getStatus()
        );

        List<Map<String, Object>> itemList =
                new ArrayList<>();

        for (OrderItem orderItem : orderItems) {

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "foodName",
                    orderItem.getFoodName()
            );

            item.put(
                    "quantity",
                    orderItem.getQuantity()
            );

            item.put(
                    "price",
                    orderItem.getPrice()
            );

            itemList.add(item);
        }

        result.put("items", itemList);

        return result;
    }


    // =========================
    // COMPLETE ORDER
    // =========================

    @PostMapping("/complete")
    public Map<String, Object> completeOrder(
            @RequestParam String ownerEmail,
            @RequestBody Map<String, Object> request) {

        User owner = getOwner(ownerEmail);

        Canteen canteen =
                canteenRepository.findByOwner(owner)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Canteen not found."
                                )
                        );


        Object orderIdValue =
                request.get("orderId");

        if (orderIdValue == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order ID is missing."
            );
        }


        Long orderId;

        try {

            orderId =
                    Long.valueOf(
                            orderIdValue.toString()
                    );

        } catch (NumberFormatException error) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order ID."
            );
        }


        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Order not found."
                                )
                        );


        // QR already disabled
        if (!order.isQrActive()) {

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This order has already been completed."
            );
        }


        // Verify canteen ownership again
        List<OrderItem> orderItems =
                orderItemRepository
                        .findByOrderOrderByIdAsc(order);

        boolean belongsToCanteen = false;

        for (OrderItem item : orderItems) {

            if (item.getDailyMenu()
                    .getCanteen()
                    .getId()
                    .equals(canteen.getId())) {

                belongsToCanteen = true;
                break;
            }
        }


        if (!belongsToCanteen) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This order does not belong to your canteen."
            );
        }


        // Complete order
        order.setStatus("COMPLETED");

        // Permanently disable pickup QR
        order.setQrActive(false);

        orderRepository.save(order);


        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "message",
                "Order completed successfully."
        );

        result.put(
                "orderId",
                order.getId()
        );

        result.put(
                "orderCode",
                order.getOrderCode()
        );

        result.put(
                "totalAmount",
                order.getTotalAmount()
        );

        result.put(
                "status",
                order.getStatus()
        );

        result.put(
                "qrActive",
                order.isQrActive()
        );

        return result;
    }


    // =========================
    // FIND OWNER
    // =========================

    private User getOwner(String email) {

        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "User not found."
                                )
                        );


        if (user.getRole()
                != com.campusbyte.model.Role.CANTEEN_OWNER) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only canteen owners can access orders."
            );
        }


        return user;
    }
}