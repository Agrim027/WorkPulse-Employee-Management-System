package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.AttendanceRequest;
import com.workpulse.ems.dto.response.AttendanceResponse;
import com.workpulse.ems.entity.Attendance;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.enums.AttendanceStatus;
import com.workpulse.ems.exception.BadRequestException;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.repository.AttendanceRepository;
import com.workpulse.ems.repository.EmployeeRepository;
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
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttendanceServiceTests {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeProvisioningService employeeProvisioningService;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Employee sampleEmployee;
    private Attendance sampleAttendance;

    @BeforeEach
    void setUp() {
        sampleEmployee = Employee.builder()
                .id(10L)
                .employeeCode("EMP100")
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@workpulse.com")
                .build();

        sampleAttendance = Attendance.builder()
                .id(1L)
                .employee(sampleEmployee)
                .attendanceDate(LocalDate.now())
                .status(AttendanceStatus.PRESENT)
                .checkIn(LocalTime.of(9, 0))
                .checkOut(LocalTime.of(17, 0))
                .remarks("On time")
                .build();
    }

    @Test
    @DisplayName("Attendance Test 1 - Create attendance successfully")
    void testCreateAttendance_Success() {
        AttendanceRequest request = AttendanceRequest.builder()
                .employeeId(10L)
                .attendanceDate(LocalDate.now())
                .status(AttendanceStatus.PRESENT)
                .checkIn(LocalTime.of(9, 0))
                .checkOut(LocalTime.of(17, 0))
                .remarks("Regular day")
                .build();

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(sampleEmployee));
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(10L, LocalDate.now())).thenReturn(false);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(sampleAttendance);

        AttendanceResponse response = attendanceService.createAttendance(request);
        assertNotNull(response);
        assertEquals(AttendanceStatus.PRESENT, response.getStatus());
    }

    @Test
    @DisplayName("Attendance Test 2 - Duplicate attendance rejection")
    void testCreateAttendance_DuplicateRejection() {
        AttendanceRequest request = AttendanceRequest.builder()
                .employeeId(10L)
                .attendanceDate(LocalDate.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(sampleEmployee));
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(10L, LocalDate.now())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> attendanceService.createAttendance(request));
    }

    @Test
    @DisplayName("Attendance Test 3 - Check-out before check-in validation failure")
    void testCreateAttendance_InvalidCheckOutTime() {
        AttendanceRequest request = AttendanceRequest.builder()
                .employeeId(10L)
                .attendanceDate(LocalDate.now())
                .status(AttendanceStatus.PRESENT)
                .checkIn(LocalTime.of(17, 0))
                .checkOut(LocalTime.of(9, 0))
                .build();

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(sampleEmployee));
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(10L, LocalDate.now())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> attendanceService.createAttendance(request));
    }

    @Test
    @DisplayName("Attendance Test 4 - Self Check-In Success")
    void testCheckIn_Success() {
        UserDetailsImpl employeeUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 10L, true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(employeeProvisioningService.getOrCreateEmployeeForUserId(100L)).thenReturn(sampleEmployee);
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(10L, LocalDate.now())).thenReturn(false);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(sampleAttendance);

        AttendanceResponse response = attendanceService.checkIn(employeeUser);
        assertNotNull(response);
    }

    @Test
    @DisplayName("Attendance Test 5 - Duplicate Check-In Rejection")
    void testCheckIn_DuplicateRejection() {
        UserDetailsImpl employeeUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 10L, true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(employeeProvisioningService.getOrCreateEmployeeForUserId(100L)).thenReturn(sampleEmployee);
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(10L, LocalDate.now())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> attendanceService.checkIn(employeeUser));
    }

    @Test
    @DisplayName("Attendance Test 6 - Check-Out without Check-In Rejection")
    void testCheckOut_WithoutCheckInRejection() {
        UserDetailsImpl employeeUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 10L, true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(employeeProvisioningService.getOrCreateEmployeeForUserId(100L)).thenReturn(sampleEmployee);
        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(10L, LocalDate.now())).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> attendanceService.checkOut(employeeUser));
    }

    @Test
    @DisplayName("Attendance Test 7 - IDOR Protection Guard Blocked")
    void testIDORProtection_Blocked() {
        UserDetailsImpl empUser = new UserDetailsImpl(
                100L, "empuser", "emp@workpulse.com", "pass", 99L, true, // employeeId 99
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );

        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(sampleAttendance)); // sample is employee 10

        assertThrows(AccessDeniedException.class, () -> attendanceService.getAttendanceById(1L, empUser));
    }

    @Test
    @DisplayName("Attendance Test 8 - Delete Attendance Success")
    void testDeleteAttendance_Success() {
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(sampleAttendance));
        attendanceService.deleteAttendance(1L);
        verify(attendanceRepository, times(1)).delete(sampleAttendance);
    }
}
