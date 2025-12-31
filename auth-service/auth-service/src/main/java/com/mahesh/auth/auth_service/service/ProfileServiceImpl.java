package com.mahesh.auth.auth_service.service;

import com.mahesh.auth.auth_service.entity.UserEntity;
import com.mahesh.auth.auth_service.io.ProfileRequest;
import com.mahesh.auth.auth_service.io.ProfileResponse;
import com.mahesh.auth.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;


    @Override
    public ProfileResponse createProfile(ProfileRequest request) {

        // 1️⃣ Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        // 2️⃣ Convert request to entity
        UserEntity newProfile = convertToUserEntity(request);

        // 3️⃣ Save user
        newProfile = userRepository.save(newProfile);

        // 4️⃣ Return response
        return convertToProfileResponse(newProfile);
    }

    @Override
    public ProfileResponse getProfile(String email) {
       UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not Found: "+ email));
       return  convertToProfileResponse(existingUser);

    }

    @Override
    public void sendResetOtp(String email) {

        // 1️⃣ Find user by email
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        // 2️⃣ Generate 6-digit OTP
        String otp = String.valueOf(
                ThreadLocalRandom.current().nextInt(100000, 1000000)
        );

        // 3️⃣ Calculate expiry time (current time + 15 minutes)
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);

        // 4️⃣ Update user entity
        existingUser.setResetOtp(otp);
        existingUser.setResetOtpExpiredAt(expiryTime);

        // 5️⃣ Save updated user in DB
        userRepository.save(existingUser);

        try {
            // 6️⃣ Send OTP email
            emailService.sendResetOtpEmail(
                    existingUser.getEmail(),
                    otp
            );
        } catch (Exception ex) {
            throw new RuntimeException("Failed to send reset OTP email");
        }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        // 1️⃣ Validate OTP
        if (existingUser.getResetOtp() == null ||
                !existingUser.getResetOtp().equals(otp)) {

            throw new RuntimeException("Invalid OTP");
        }

        // 2️⃣ Check OTP expiry
        if (existingUser.getResetOtpExpiredAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP expired");
        }

        // 3️⃣ Update password (encoded)
        existingUser.setPassword(passwordEncoder.encode(newPassword));

        // 4️⃣ Clear OTP after successful reset
        existingUser.setResetOtp(null);
        existingUser.setResetOtpExpiredAt(null);

        // 5️⃣ Save updated user
        userRepository.save(existingUser);
    }

    @Override
    public void sendOtp(String email) {

        // 1️⃣ Find user by email
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found with email: " + email));

        // 2️⃣ If account already verified, do nothing
        if (Boolean.TRUE.equals(existingUser.getIsAccountVerified())) {
            return;
        }

        // 3️⃣ Generate 6-digit OTP
        String otp = String.valueOf(
                ThreadLocalRandom.current().nextInt(100000, 1000000)
        );

        // 4️⃣ Expiry time (10 minutes)
        long expiryTime = System.currentTimeMillis() + (10 * 60 * 1000);

        // 5️⃣ Save OTP details in user entity
        existingUser.setVerifyOtp(otp);
        existingUser.setVerifyOtpExpireAt(expiryTime);

        // 6️⃣ Save updated user in database
        userRepository.save(existingUser);

        // 7️⃣ Send OTP email
        emailService.sendResetOtpEmail(existingUser.getEmail(), otp);

        try{
            emailService.sendOtpEmail(existingUser.getEmail(), otp);
        }catch (Exception ex){
            throw new RuntimeException("Unable to send email");
        }
    }


    @Override
    public void verifyOtp(String email, String otp) {

        // 1️⃣ Find user by email
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found with email: " + email));

        // 2️⃣ Check OTP exists
        if (existingUser.getVerifyOtp() == null) {
            throw new RuntimeException("OTP not generated");
        }

        // 3️⃣ Validate OTP
        if (!existingUser.getVerifyOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // 4️⃣ Check OTP expiry
        if (existingUser.getVerifyOtpExpireAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP expired");
        }

        // 5️⃣ Mark account as verified
        existingUser.setIsAccountVerified(true);

        // 6️⃣ Clear OTP data (important)
        existingUser.setVerifyOtp(null);
        existingUser.setVerifyOtpExpireAt(null);

        // 7️⃣ Save updated user
        userRepository.save(existingUser);
    }


    @Override
    public String getLoggedInUserId(String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        return user.getUserId();
    }



    private ProfileResponse convertToProfileResponse(UserEntity user) {

        return ProfileResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .isAccountVerified(user.getIsAccountVerified())
                .build();
    }

    private UserEntity convertToUserEntity(ProfileRequest request) {

        return UserEntity.builder()
                .userId(UUID.randomUUID().toString())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // 🔥 FIX
                .isAccountVerified(false)
                .verifyOtp(null)
                .verifyOtpExpireAt(0L)
                .resetOtp(null)
                .resetOtpExpiredAt(0L)
                .build();
    }
}
