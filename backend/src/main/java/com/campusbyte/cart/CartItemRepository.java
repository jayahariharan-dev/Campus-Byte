package com.campusbyte.cart;

import com.campusbyte.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByStudentOrderByIdAsc(User student);

    Optional<CartItem> findByStudentIdAndDailyMenuId(
            Long studentId,
            Long dailyMenuId
    );

    Optional<CartItem> findByIdAndStudent(
            Long id,
            User student
    );
}