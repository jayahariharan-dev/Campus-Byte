package com.campusbyte.config;

import com.campusbyte.canteen.Canteen;
import com.campusbyte.canteen.CanteenRepository;
import com.campusbyte.model.Role;
import com.campusbyte.model.User;
import com.campusbyte.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createDemoCanteen(
            UserRepository users,
            CanteenRepository canteens) {

        return args -> {

            User owner = users
                    .findByEmailIgnoreCase("owner@campusbyte.com")
                    .orElseGet(() -> {

                        User user = new User();

                        user.setName("Campus Canteen");
                        user.setEnrollmentNumber("CANTEEN001");
                        user.setCollege("Campus Byte");
                        user.setEmail("owner@campusbyte.com");

                        user.setPassword(
                                new BCryptPasswordEncoder()
                                        .encode("owner123")
                        );

                        user.setRole(Role.CANTEEN_OWNER);

                        return users.save(user);
                    });

            if (canteens.findByOwner(owner).isEmpty()) {

                Canteen canteen = new Canteen();

                canteen.setName("Campus Main Canteen");
                canteen.setDescription(
                        "Fresh meals and snacks for students"
                );
                canteen.setLocation("Main Block");
                canteen.setContact("Campus Canteen");
                canteen.setOwner(owner);
                canteen.setActive(true);

                canteens.save(canteen);
            }
        };
    }
}