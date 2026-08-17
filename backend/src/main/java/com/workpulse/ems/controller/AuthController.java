package com.workpulse.ems.controller;

import com.workpulse.ems.dto.request.LoginRequest;
import com.workpulse.ems.dto.request.RegisterRequest;
import com.workpulse.ems.dto.response.ApiResponse;
import com.workpulse.ems.dto.response.JwtResponse;
import com.workpulse.ems.dto.response.UserResponse;
import com.workpulse.ems.security.services.UserDetailsImpl;
import com.workpulse.ems.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", jwtResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        ApiResponse<String> response = authService.registerUser(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "User is not authenticated"));
        }
        UserResponse userResponse = authService.getCurrentUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved successfully", userResponse));
    }
}
