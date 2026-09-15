package com.example.expensetracker.service;

import com.example.expensetracker.entity.OtpVerification;
import com.example.expensetracker.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OtpService {

    @Autowired
    private OtpVerificationRepository otpRepository;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    private final SecureRandom random = new SecureRandom();

    private static final int OTP_EXPIRY_MINUTES = 5;

    private final RestClient brevoClient = RestClient.builder()
            .baseUrl("https://api.brevo.com")
            .build();

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

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException(
                    "BREVO_API_KEY is not configured"
            );
        }

        String purposeText =
                "REGISTER".equals(purpose)
                        ? "verify your email and complete registration"
                        : "reset your Expense Tracker password";

        String emailText =
                "Hello,\n\n"
                + "Your OTP to "
                + purposeText
                + " is:\n\n"
                + otp
                + "\n\n"
                + "This OTP is valid for 5 minutes.\n"
                + "Please do not share this OTP with anyone.\n\n"
                + "Regards,\n"
                + "Expense Tracker Team";

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of(
                        "name", "Expense Tracker",
                        "email", "ragiakash6@gmail.com"
                ),
                "to", List.of(
                        Map.of(
                                "email", email
                        )
                ),
                "subject",
                "Expense Tracker - Email Verification OTP",
                "textContent",
                emailText
        );

        brevoClient.post()
                .uri("/v3/smtp/email")
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();
    }
}