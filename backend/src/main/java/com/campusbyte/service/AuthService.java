package com.campusbyte.service;

import com.campusbyte.dto.AuthResponse;
import com.campusbyte.dto.LoginRequest;
import com.campusbyte.dto.SignupRequest;
import com.campusbyte.model.Role;
import com.campusbyte.model.User;
import com.campusbyte.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String enrollment = request.getEnrollmentNumber().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        if (userRepository.existsByEnrollmentNumber(enrollment)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This enrollment number is already registered.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEnrollmentNumber(enrollment);
        user.setCollege(request.getCollege().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);

        User saved = userRepository.save(user);

        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getCollege(), saved.getRole().name(), "Account created successfully.");
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getCollege(), user.getRole().name(), "Login successful.");
    }
}
