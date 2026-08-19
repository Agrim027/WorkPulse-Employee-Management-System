package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.LoginRequest;
import com.workpulse.ems.dto.request.RegisterRequest;
import com.workpulse.ems.dto.response.ApiResponse;
import com.workpulse.ems.dto.response.JwtResponse;
import com.workpulse.ems.dto.response.UserResponse;
import com.workpulse.ems.entity.Role;
import com.workpulse.ems.entity.User;
import com.workpulse.ems.entity.enums.ERole;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.exception.ResourceNotFoundException;
import com.workpulse.ems.repository.RoleRepository;
import com.workpulse.ems.repository.UserRepository;
import com.workpulse.ems.security.jwt.JwtUtils;
import com.workpulse.ems.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmployeeProvisioningService employeeProvisioningService;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .roles(roles)
                .employeeId(userDetails.getEmployeeId())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new DuplicateResourceException("Username '" + registerRequest.getUsername() + "' is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("Email '" + registerRequest.getEmail() + "' is already in use!");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .enabled(true)
                .build();

        Set<Role> roles = new HashSet<>();
        if ("admin".equalsIgnoreCase(registerRequest.getUsername())) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).description("Admin Role").build()));
            roles.add(adminRole);
        } else {
            Role employeeRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_EMPLOYEE).description("Employee User").build()));
            roles.add(employeeRole);
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        if (!roles.stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN)) {
            employeeProvisioningService.getOrCreateEmployeeForUser(savedUser);
        }

        return ApiResponse.success("User registered successfully!");
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .roles(roles)
                .employeeId(userDetails.getEmployeeId())
                .build();
    }
}
