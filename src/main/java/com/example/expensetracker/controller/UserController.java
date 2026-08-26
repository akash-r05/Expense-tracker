package com.example.expensetracker.controller;

import com.example.expensetracker.entity.User;
import com.example.expensetracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String firstName,
            @RequestParam String lastName) {

        User user = userService.registerUser(
                email,
                password,
                firstName,
                lastName
        );

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String email,
            @RequestParam String password) {

        User user = userService.authenticateUser(
                email,
                password
        );

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {

        userService.resetPassword(email, newPassword);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Password reset successfully");
        response.put("email", email);

        return ResponseEntity.ok(response);
    }
}