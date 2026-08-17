package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.DepartmentRequest;
import com.workpulse.ems.dto.response.DepartmentResponse;
import com.workpulse.ems.entity.Department;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.exception.ResourceNotFoundException;
import com.workpulse.ems.repository.DepartmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DepartmentServiceTests {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentServiceImpl departmentService;

    private Department sampleDepartment;

    @BeforeEach
    void setUp() {
        sampleDepartment = Department.builder()
                .id(1L)
                .departmentCode("DEV")
                .name("Engineering")
                .description("Software Development")
                .build();
    }

    @Test
    @DisplayName("Department Test - Create department successfully")
    void testCreateDepartment_Success() {
        DepartmentRequest request = DepartmentRequest.builder()
                .departmentCode("DEV")
                .name("Engineering")
                .description("Software Development")
                .build();

        when(departmentRepository.existsByDepartmentCode("DEV")).thenReturn(false);
        when(departmentRepository.existsByName("Engineering")).thenReturn(false);
        when(departmentRepository.save(any(Department.class))).thenReturn(sampleDepartment);

        DepartmentResponse response = departmentService.createDepartment(request);

        assertNotNull(response);
        assertEquals("DEV", response.getDepartmentCode());
        assertEquals("Engineering", response.getName());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    @DisplayName("Department Test - Duplicate code rejection")
    void testCreateDepartment_DuplicateCode() {
        DepartmentRequest request = DepartmentRequest.builder()
                .departmentCode("DEV")
                .name("Software")
                .build();

        when(departmentRepository.existsByDepartmentCode("DEV")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> departmentService.createDepartment(request));
        verify(departmentRepository, never()).save(any(Department.class));
    }

    @Test
    @DisplayName("Department Test - Get department by ID success & not found")
    void testGetDepartmentById() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(sampleDepartment));
        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        DepartmentResponse found = departmentService.getDepartmentById(1L);
        assertEquals("DEV", found.getDepartmentCode());

        assertThrows(ResourceNotFoundException.class, () -> departmentService.getDepartmentById(99L));
    }
}
