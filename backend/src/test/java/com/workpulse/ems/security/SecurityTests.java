package com.workpulse.ems.security;

import com.workpulse.ems.dto.request.RegisterRequest;
import com.workpulse.ems.entity.Role;
import com.workpulse.ems.entity.User;
import com.workpulse.ems.entity.enums.ERole;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.repository.RoleRepository;
import com.workpulse.ems.repository.UserRepository;
import com.workpulse.ems.security.jwt.JwtUtils;
import com.workpulse.ems.security.services.UserDetailsImpl;
import com.workpulse.ems.service.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SecurityTests {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private com.workpulse.ems.service.EmployeeProvisioningService employeeProvisioningService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private Role employeeRole;

    @BeforeEach
    void setUp() {
        employeeRole = Role.builder()
                .id(1L)
                .name(ERole.ROLE_EMPLOYEE)
                .description("Employee User")
                .build();

        sampleUser = User.builder()
                .id(100L)
                .username("johndoe")
                .email("john.doe@workpulse.com")
                .password("$2a$12$hashedPasswordExampleHere")
                .enabled(true)
                .roles(Set.of(employeeRole))
                .build();
    }

    @Test
    @DisplayName("Password Test - Hashing ensures raw password is never stored directly")
    void testPasswordHashing() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);

        String rawPassword = "SecretPassword123!";
        String encodedPassword = encoder.encode(rawPassword);

        assertNotEquals(rawPassword, encodedPassword);
        assertTrue(encoder.matches(rawPassword, encodedPassword));
        assertFalse(encoder.matches("WrongPassword", encodedPassword));
    }

    @Test
    @DisplayName("Registration Test - Successful registration with BCrypt hashing and default ROLE_EMPLOYEE")
    void testRegisterUser_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .email("newuser@workpulse.com")
                .password("Password123!")
                .build();

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@workpulse.com")).thenReturn(false);
        when(roleRepository.findByName(ERole.ROLE_EMPLOYEE)).thenReturn(Optional.of(employeeRole));
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed_Password123!");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        var response = authService.registerUser(request);

        assertNotNull(response);
        assertEquals(200, response.getStatus());
        assertEquals("User registered successfully!", response.getMessage());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Registration Test - Duplicate username rejection")
    void testRegisterUser_DuplicateUsername() {
        RegisterRequest request = RegisterRequest.builder()
                .username("johndoe")
                .email("another@workpulse.com")
                .password("Password123!")
                .build();

        when(userRepository.existsByUsername("johndoe")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UserDetailsImpl Test - Authority and Employee ID Mapping")
    void testUserDetailsImplMapping() {
        UserDetailsImpl userDetails = UserDetailsImpl.build(sampleUser, 55L);

        assertEquals(100L, userDetails.getId());
        assertEquals("johndoe", userDetails.getUsername());
        assertEquals("john.doe@workpulse.com", userDetails.getEmail());
        assertEquals(55L, userDetails.getEmployeeId());
        assertTrue(userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
    }
}
