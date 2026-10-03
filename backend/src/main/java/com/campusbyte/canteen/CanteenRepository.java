package com.campusbyte.canteen;

import com.campusbyte.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CanteenRepository extends JpaRepository<Canteen, Long> {

    Optional<Canteen> findByOwner(User owner);
}