package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.LoginRequest;
import com.workpulse.ems.dto.request.RegisterRequest;
import com.workpulse.ems.dto.response.ApiResponse;
import com.workpulse.ems.dto.response.JwtResponse;
import com.workpulse.ems.dto.response.UserResponse;
import com.workpulse.ems.security.services.UserDetailsImpl;

public interface AuthService {

    JwtResponse authenticateUser(LoginRequest loginRequest);

    ApiResponse<String> registerUser(RegisterRequest registerRequest);

    UserResponse getCurrentUser(UserDetailsImpl userDetails);
}
