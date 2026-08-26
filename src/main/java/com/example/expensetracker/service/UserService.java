package com.example.expensetracker.service;

import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.exception.BadRequestException;
import com.example.expensetracker.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(
            String email,
            String password,
            String firstName,
            String lastName) {

        log.info("Registering new user: {}", email);

        if (userRepository.findByEmail(email) != null) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(User.Role.USER);
        user.setActive(true);

        return userRepository.save(user);
    }

    public User authenticateUser(
            String email,
            String password) {

        log.info("Authenticating user: {}", email);

        User user = userRepository.findByEmail(email);

        if (user == null || !user.getActive()) {
            throw new ResourceNotFoundException(
                "User not found or inactive"
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new BadRequestException("Invalid password");
        }

        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void resetPassword(String email, String newPassword) {

        log.info("Resetting password for user: {}", email);

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        log.info("Password reset successful for: {}", email);
    }
}