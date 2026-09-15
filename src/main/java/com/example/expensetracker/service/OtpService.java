package com.example.expensetracker.service;

import com.example.expensetracker.entity.OtpVerification;
import com.example.expensetracker.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Transactional
public class OtpService {

    @Autowired
    private OtpVerificationRepository otpRepository;

    @Autowired
    private JavaMailSender mailSender;

    private final SecureRandom random = new SecureRandom();

    private static final int OTP_EXPIRY_MINUTES = 5;

    public void sendOtp(String email, String purpose) {

        String otp = String.format(
                "%06d",
                random.nextInt(1_000_000)
        );

        otpRepository.deleteByEmailAndPurpose(
                email,
                purpose
        );

        OtpVerification verification =
                new OtpVerification();

        verification.setEmail(email);
        verification.setOtp(otp);
        verification.setPurpose(purpose);
        verification.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(OTP_EXPIRY_MINUTES)
        );

        otpRepository.save(verification);

        sendEmail(email, otp, purpose);
    }

    public boolean verifyOtp(
            String email,
            String otp,
            String purpose) {

        OtpVerification verification =
                otpRepository
                        .findTopByEmailAndPurposeOrderByIdDesc(
                                email,
                                purpose
                        )
                        .orElse(null);

        if (verification == null) {
            return false;
        }

        if (verification.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            otpRepository.delete(verification);
            return false;
        }

        if (!verification.getOtp().equals(otp)) {
            return false;
        }

        otpRepository.delete(verification);

        return true;
    }

    private void sendEmail(
            String email,
            String otp,
            String purpose) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);
        message.setSubject(
                "Expense Tracker - Email Verification OTP"
        );

        String purposeText =
                "REGISTER".equals(purpose)
                        ? "verify your email and complete registration"
                        : "reset your Expense Tracker password";

        message.setText(
                "Hello,\n\n"
                + "Your OTP to "
                + purposeText
                + " is:\n\n"
                + otp
                + "\n\n"
                + "This OTP is valid for 5 minutes.\n"
                + "Please do not share this OTP with anyone.\n\n"
                + "Regards,\n"
                + "Expense Tracker Team"
        );

        mailSender.send(message);
    }
}