package com.mahesh.auth.auth_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.mail.smtp.from}")
    private String fromEmail;

    public void sendWelcomeEmail(String toEmail, String name) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Auth Service");
        message.setText(
                "Hello " + name + ",\n\n" +
                        "Welcome to our application!\n" +
                        "Your account has been created successfully.\n\n" +
                        "Thank you,\n" +
                        "Auth Service Team"
        );

        mailSender.send(message); // ✅ IMPORTANT
    }

    public void sendResetOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");

        message.setText(
                "Hello,\n\n" +
                        "Your OTP for resetting your password is: " + otp + "\n\n" +
                        "This OTP is valid for 15 minutes.\n" +
                        "Please do not share this OTP with anyone.\n\n" +
                        "Regards,\n" +
                        "Auth Service Team"
        );

        mailSender.send(message);
    }

    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account Verification OTP");
        message.setText(
                "Your OTP is " + otp + ". Verify your account using this OTP."
        );

        mailSender.send(message);
    }


}
