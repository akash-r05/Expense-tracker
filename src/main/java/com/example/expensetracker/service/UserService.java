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

    @Autowired
    private OtpService otpService;

    // START REGISTRATION
    public void startRegistration(
            String email,
            String password,
            String firstName,
            String lastName) {

        log.info("Starting registration for: {}", email);

        if (userRepository.findByEmail(email) != null) {
            throw new BadRequestException(
                    "Email already registered"
            );
        }

        if (email == null || email.isBlank()
                || password == null || password.isBlank()
                || firstName == null || firstName.isBlank()
                || lastName == null || lastName.isBlank()) {

            throw new BadRequestException(
                    "All fields are required"
            );
        }

        otpService.sendOtp(
                email,
                "REGISTER"
        );

        log.info(
                "Registration OTP sent to: {}",
                email
        );
    }

    // COMPLETE REGISTRATION AFTER OTP
    public User verifyRegistration(
            String email,
            String otp,
            String password,
            String firstName,
            String lastName) {

        log.info(
                "Verifying registration OTP for: {}",
                email
        );

        if (!otpService.verifyOtp(
                email,
                otp,
                "REGISTER")) {

            throw new BadRequestException(
                    "Invalid or expired OTP"
            );
        }

        if (userRepository.findByEmail(email) != null) {
            throw new BadRequestException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(password)
        );
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(User.Role.USER);
        user.setActive(true);

        return userRepository.save(user);
    }

    // LOGIN
    public User authenticateUser(
            String email,
            String password) {

        log.info(
                "Authenticating user: {}",
                email
        );

        User user =
                userRepository.findByEmail(email);

        if (user == null || !user.getActive()) {
            throw new ResourceNotFoundException(
                    "User not found or inactive"
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new BadRequestException(
                    "Invalid password"
            );
        }

        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // START FORGOT PASSWORD
    public void startPasswordReset(String email) {

        log.info(
                "Starting password reset for: {}",
                email
        );

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        otpService.sendOtp(
                email,
                "RESET_PASSWORD"
        );
    }

    // RESET PASSWORD AFTER OTP
    public void resetPassword(
            String email,
            String otp,
            String newPassword) {

        log.info(
                "Resetting password for: {}",
                email
        );

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        if (!otpService.verifyOtp(
                email,
                otp,
                "RESET_PASSWORD")) {

            throw new BadRequestException(
                    "Invalid or expired OTP"
            );
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        log.info(
                "Password reset successful for: {}",
                email
        );
    }
}