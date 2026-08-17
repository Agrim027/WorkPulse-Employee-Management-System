package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.SalaryRequest;
import com.workpulse.ems.dto.response.SalaryResponse;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.Salary;
import com.workpulse.ems.entity.enums.PaymentStatus;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.repository.EmployeeRepository;
import com.workpulse.ems.repository.SalaryRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SalaryServiceTests {

    @Mock
    private SalaryRepository salaryRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private SalaryServiceImpl salaryService;

    private Employee sampleEmployee;
    private Salary sampleSalary;

    @BeforeEach
    void setUp() {
        sampleEmployee = Employee.builder()
                .id(10L)
                .employeeCode("EMP100")
                .firstName("Bob")
                .lastName("Johnson")
                .email("bob@workpulse.com")
                .build();

        sampleSalary = Salary.builder()
                .id(5L)
                .employee(sampleEmployee)
                .basicSalary(new BigDecimal("50000.00"))
                .allowances(new BigDecimal("5000.00"))
                .deductions(new BigDecimal("2000.00"))
                .netSalary(new BigDecimal("53000.00"))
                .salaryMonth("2026-08")
                .paymentStatus(PaymentStatus.PAID)
                .paymentDate(LocalDate.now())
                .build();
    }

    @Test
    @DisplayName("Salary Test 1 - Backend Net Salary Calculation (50000 + 5000 - 2000 = 53000)")
    void testCreateSalary_NetSalaryCalculation() {
        SalaryRequest request = SalaryRequest.builder()
                .employeeId(10L)
                .basicSalary(new BigDecimal("50000.00"))
                .allowances(new BigDecimal("5000.00"))
                .deductions(new BigDecimal("2000.00"))
                .salaryMonth("2026-08")
                .paymentStatus(PaymentStatus.PAID)
                .paymentDate(LocalDate.now())
                .build();

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(sampleEmployee));
        when(salaryRepository.existsByEmployeeIdAndSalaryMonth(10L, "2026-08")).thenReturn(false);
        when(salaryRepository.save(any(Salary.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SalaryResponse response = salaryService.createSalary(request);
        assertNotNull(response);
        assertEquals(new BigDecimal("53000.00"), response.getNetSalary());
    }

    @Test
    @DisplayName("Salary Test 2 - Duplicate Salary Month Rejection")
    void testCreateSalary_DuplicateMonthRejection() {
        SalaryRequest request = SalaryRequest.builder()
                .employeeId(10L)
                .basicSalary(new BigDecimal("50000.00"))
                .allowances(new BigDecimal("5000.00"))
                .deductions(new BigDecimal("2000.00"))
                .salaryMonth("2026-08")
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(sampleEmployee));
        when(salaryRepository.existsByEmployeeIdAndSalaryMonth(10L, "2026-08")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> salaryService.createSalary(request));
    }

    @Test
    @DisplayName("Salary Test 3 - IDOR Guard Blocked for Employee role accessing another salary slip")
    void testIDORProtection_Blocked() {
        UserDetailsImpl empUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 99L, true, // employee 99
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(salaryRepository.findById(5L)).thenReturn(Optional.of(sampleSalary)); // sample is employee 10

        assertThrows(AccessDeniedException.class, () -> salaryService.getSalaryById(5L, empUser));
    }

    @Test
    @DisplayName("Salary Test 4 - IDOR Guard Allowed for self salary slip access")
    void testIDORProtection_AllowedSelf() {
        UserDetailsImpl empUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 10L, true, // employee 10
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(salaryRepository.findById(5L)).thenReturn(Optional.of(sampleSalary));

        SalaryResponse response = salaryService.getSalaryById(5L, empUser);
        assertNotNull(response);
        assertEquals(new BigDecimal("53000.00"), response.getNetSalary());
    }

    @Test
    @DisplayName("Salary Test 5 - Delete Salary Record Success")
    void testDeleteSalary_Success() {
        when(salaryRepository.findById(5L)).thenReturn(Optional.of(sampleSalary));
        salaryService.deleteSalary(5L);
        verify(salaryRepository, times(1)).delete(sampleSalary);
    }
}
