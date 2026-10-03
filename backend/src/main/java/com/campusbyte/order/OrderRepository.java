package com.campusbyte.order;

import com.campusbyte.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStudentOrderByIdDesc(User student);

    Optional<Order> findByQrToken(String qrToken);

    // Owner - get all orders, newest first
    List<Order> findAllByOrderByIdDesc();
}