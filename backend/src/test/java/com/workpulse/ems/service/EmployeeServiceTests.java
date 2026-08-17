package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.EmployeeRequest;
import com.workpulse.ems.dto.response.EmployeeResponse;
import com.workpulse.ems.entity.Department;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.enums.EmploymentStatus;
import com.workpulse.ems.entity.enums.Gender;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.repository.DepartmentRepository;
import com.workpulse.ems.repository.EmployeeRepository;
import com.workpulse.ems.repository.UserRepository;
import com.workpulse.ems.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTests {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Department sampleDepartment;
    private Employee sampleEmployee;

    @BeforeEach
    void setUp() {
        sampleDepartment = Department.builder()
                .id(1L)
                .departmentCode("IT")
                .name("Information Technology")
                .build();

        sampleEmployee = Employee.builder()
                .id(10L)
                .employeeCode("EMP001")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@workpulse.com")
                .joiningDate(LocalDate.now())
                .employmentStatus(EmploymentStatus.ACTIVE)
                .department(sampleDepartment)
                .build();
    }

    @Test
    @DisplayName("Employee Test - Create employee success")
    void testCreateEmployee_Success() {
        EmployeeRequest request = EmployeeRequest.builder()
                .employeeCode("EMP001")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@workpulse.com")
                .joiningDate(LocalDate.now())
                .employmentStatus(EmploymentStatus.ACTIVE)
                .departmentId(1L)
                .build();

        when(employeeRepository.existsByEmployeeCode("EMP001")).thenReturn(false);
        when(employeeRepository.existsByEmail("john.doe@workpulse.com")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(sampleDepartment));
        when(employeeRepository.save(any(Employee.class))).thenReturn(sampleEmployee);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        assertEquals("EMP001", response.getEmployeeCode());
        assertEquals("John", response.getFirstName());
    }

    @Test
    @DisplayName("Employee Test - Duplicate employee code rejection")
    void testCreateEmployee_DuplicateCode() {
        EmployeeRequest request = EmployeeRequest.builder()
                .employeeCode("EMP001")
                .firstName("John")
                .lastName("Doe")
                .email("another@workpulse.com")
                .joiningDate(LocalDate.now())
                .employmentStatus(EmploymentStatus.ACTIVE)
                .departmentId(1L)
                .build();

        when(employeeRepository.existsByEmployeeCode("EMP001")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> employeeService.createEmployee(request));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    @DisplayName("IDOR Guard Test - EMPLOYEE role blocked when accessing another employee profile")
    void testIDORProtection_Blocked() {
        UserDetailsImpl employeeUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 10L, true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(employeeRepository.findById(20L)).thenReturn(Optional.of(sampleEmployee));

        // Employee 10 attempting to view Employee 20 profile
        assertThrows(AccessDeniedException.class, () -> employeeService.getEmployeeById(20L, employeeUser));
    }

    @Test
    @DisplayName("IDOR Guard Test - EMPLOYEE role allowed when accessing own profile")
    void testIDORProtection_AllowedSelf() {
        UserDetailsImpl employeeUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 10L, true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(sampleEmployee));

        EmployeeResponse response = employeeService.getEmployeeById(10L, employeeUser);
        assertNotNull(response);
        assertEquals("EMP001", response.getEmployeeCode());
    }

    @Test
    @DisplayName("Employee Soft Delete Test - Status updated to TERMINATED")
    void testDeleteEmployee_SoftDelete() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(sampleEmployee));

        employeeService.deleteEmployee(10L);

        assertEquals(EmploymentStatus.TERMINATED, sampleEmployee.getEmploymentStatus());
        verify(employeeRepository, times(1)).save(sampleEmployee);
    }
}
