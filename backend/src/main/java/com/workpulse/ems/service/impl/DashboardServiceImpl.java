package com.workpulse.ems.service.impl;

import com.workpulse.ems.dto.response.*;
import com.workpulse.ems.entity.Attendance;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.Salary;
import com.workpulse.ems.entity.enums.AttendanceStatus;
import com.workpulse.ems.entity.enums.EmploymentStatus;
import com.workpulse.ems.repository.*;
import com.workpulse.ems.service.DashboardService;
import com.workpulse.ems.service.EmployeeProvisioningService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final SalaryRepository salaryRepository;
    private final EmployeeProvisioningService employeeProvisioningService;

    @Override
    public DashboardSummaryResponse getAdminSummary() {
        LocalDate today = LocalDate.now();

        // Employee stats
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByEmploymentStatus(EmploymentStatus.ACTIVE);
        long inactiveEmployees = employeeRepository.countByEmploymentStatus(EmploymentStatus.INACTIVE);
        long terminatedEmployees = employeeRepository.countByEmploymentStatus(EmploymentStatus.TERMINATED);
        long onLeaveEmployees = employeeRepository.countByEmploymentStatus(EmploymentStatus.ON_LEAVE);

        // Department stats
        long totalDepartments = departmentRepository.count();

        // Attendance stats for today
        long presentToday = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.PRESENT);
        long absentToday = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.ABSENT);
        long halfDayToday = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.HALF_DAY);
        long leaveToday = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.LEAVE);

        // Salary stats across all records
        long totalSalaryRecords = salaryRepository.count();
        var totalPayroll = salaryRepository.sumTotalPayroll();
        var paidAmount = salaryRepository.sumTotalPayrollByStatus(PaymentStatus.PAID);
        var pendingAmount = salaryRepository.sumTotalPayrollByStatus(PaymentStatus.PENDING);
        var cancelledAmount = salaryRepository.sumTotalPayrollByStatus(PaymentStatus.CANCELLED);

        return DashboardSummaryResponse.builder()
                .employees(DashboardSummaryResponse.EmployeeStats.builder()
                        .total(totalEmployees)
                        .active(activeEmployees)
                        .inactive(inactiveEmployees)
                        .terminated(terminatedEmployees)
                        .onLeave(onLeaveEmployees)
                        .build())
                .departments(DashboardSummaryResponse.DepartmentStats.builder()
                        .total(totalDepartments)
                        .build())
                .attendance(DashboardSummaryResponse.AttendanceStats.builder()
                        .date(today)
                        .present(presentToday)
                        .absent(absentToday)
                        .halfDay(halfDayToday)
                        .leave(leaveToday)
                        .build())
                .salary(DashboardSummaryResponse.SalaryStats.builder()
                        .totalRecords(totalSalaryRecords)
                        .totalPayroll(totalPayroll)
                        .paidAmount(paidAmount)
                        .pendingAmount(pendingAmount)
                        .cancelledAmount(cancelledAmount)
                        .build())
                .build();
    }

    @Override
    public EmployeeDashboardSummaryResponse getEmployeeSummary(String username) {
        Employee employee = employeeProvisioningService.getOrCreateEmployeeForUsername(username);

        LocalDate today = LocalDate.now();
        Optional<Attendance> todayAttendanceOpt = attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), today);
        Optional<Salary> latestSalaryOpt = salaryRepository.findTopByEmployeeIdOrderBySalaryMonthDesc(employee.getId());

        EmployeeResponse profileResponse = mapToEmployeeResponse(employee);
        AttendanceResponse attendanceResponse = todayAttendanceOpt.map(this::mapToAttendanceResponse).orElse(null);
        SalaryResponse salaryResponse = latestSalaryOpt.map(this::mapToSalaryResponse).orElse(null);

        return EmployeeDashboardSummaryResponse.builder()
                .profile(profileResponse)
                .todayAttendance(attendanceResponse)
                .latestSalary(salaryResponse)
                .build();
    }

    private EmployeeResponse mapToEmployeeResponse(Employee emp) {
        DepartmentSummaryResponse deptSummary = null;
        if (emp.getDepartment() != null) {
            deptSummary = DepartmentSummaryResponse.builder()
                    .id(emp.getDepartment().getId())
                    .departmentCode(emp.getDepartment().getDepartmentCode())
                    .name(emp.getDepartment().getName())
                    .build();
        }

        UserResponse userSummary = null;
        if (emp.getUser() != null) {
            List<String> roles = emp.getUser().getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toList());

            userSummary = UserResponse.builder()
                    .id(emp.getUser().getId())
                    .username(emp.getUser().getUsername())
                    .email(emp.getUser().getEmail())
                    .enabled(emp.getUser().isEnabled())
                    .roles(roles)
                    .employeeId(emp.getId())
                    .build();
        }

        return EmployeeResponse.builder()
                .id(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .dateOfBirth(emp.getDateOfBirth())
                .gender(emp.getGender())
                .address(emp.getAddress())
                .joiningDate(emp.getJoiningDate())
                .employmentStatus(emp.getEmploymentStatus())
                .department(deptSummary)
                .user(userSummary)
                .createdAt(emp.getCreatedAt())
                .updatedAt(emp.getUpdatedAt())
                .build();
    }

    private AttendanceResponse mapToAttendanceResponse(Attendance att) {
        return AttendanceResponse.builder()
                .id(att.getId())
                .employee(mapToEmployeeResponse(att.getEmployee()))
                .attendanceDate(att.getAttendanceDate())
                .status(att.getStatus())
                .checkIn(att.getCheckIn())
                .checkOut(att.getCheckOut())
                .remarks(att.getRemarks())
                .createdAt(att.getCreatedAt())
                .updatedAt(att.getUpdatedAt())
                .build();
    }

    private SalaryResponse mapToSalaryResponse(Salary sal) {
        return SalaryResponse.builder()
                .id(sal.getId())
                .employee(mapToEmployeeResponse(sal.getEmployee()))
                .basicSalary(sal.getBasicSalary())
                .allowances(sal.getAllowances())
                .deductions(sal.getDeductions())
                .netSalary(sal.getNetSalary())
                .salaryMonth(sal.getSalaryMonth())
                .paymentStatus(sal.getPaymentStatus())
                .paymentDate(sal.getPaymentDate())
                .createdAt(sal.getCreatedAt())
                .updatedAt(sal.getUpdatedAt())
                .build();
    }
}
