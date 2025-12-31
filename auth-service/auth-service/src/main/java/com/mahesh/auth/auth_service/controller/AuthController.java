package com.mahesh.auth.auth_service.controller;

import com.mahesh.auth.auth_service.io.AuthRequest;
import com.mahesh.auth.auth_service.io.AuthResponse;
import com.mahesh.auth.auth_service.io.ResetPasswordRequest;
import com.mahesh.auth.auth_service.service.AppUserDetailsService;
import com.mahesh.auth.auth_service.service.ProfileService;
import com.mahesh.auth.auth_service.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.util.Map;


@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService appUserDetailsService;
    private final JwtUtil jwtUtil;
    private final ProfileService profileService;

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        try {
            authenticate(request.getEmail(), request.getPassword());

            UserDetails userDetails =
                    appUserDetailsService.loadUserByUsername(request.getEmail());

            String jwtToken = jwtUtil.generateToken(userDetails);

            ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new AuthResponse(request.getEmail(), jwtToken));

        } catch (BadCredentialsException ex) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", true, "message", "Email or password is incorrect"));

        } catch (DisabledException ex) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", true, "message", "Account is disabled"));

        } catch (Exception ex) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", true, "message", "Authentication failed"));
        }
    }

    // ================= AUTHENTICATE HELPER =================
    private void authenticate(String email, String password) {
        System.out.println("AUTH ATTEMPT: " + email);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
    }

    // ================= IS AUTHENTICATED =================
    @GetMapping("/is-authenticated")
    public ResponseEntity<Boolean> isAuthenticated(
            @CurrentSecurityContext(expression = "authentication?.name") String email) {

        return ResponseEntity.ok(email != null);
    }

    // ================= SEND RESET OTP =================
    @PostMapping("/send-reset-otp")
    public ResponseEntity<?> sendResetOtp(@RequestParam String email) {

        try {
            profileService.sendResetOtp(email);
            return ResponseEntity.ok(Map.of("message", "Reset OTP sent"));

        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        try {
            profileService.resetPassword(
                    request.getEmail(),
                    request.getOtp(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(
                    Map.of("message", "Password reset successfully"));

        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", true, "message", ex.getMessage()));
        }
    }

    // ================= SEND VERIFY OTP =================
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @CurrentSecurityContext(expression = "authentication?.name") String email) {

        try {
            profileService.sendOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));

        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    // ================= VERIFY EMAIL =================
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @RequestBody Map<String, Object> request,
            @CurrentSecurityContext(expression = "authentication?.name") String email) {

        if (!request.containsKey("otp") || request.get("otp") == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "OTP is required");
        }

        String otp = request.get("otp").toString();

        try {
            profileService.verifyOtp(email, otp);
            return ResponseEntity.ok(
                    Map.of("message", "Email verified successfully"));

        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }


}
