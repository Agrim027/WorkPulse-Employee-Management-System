package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.AttendanceRequest;
import com.workpulse.ems.dto.response.AttendanceResponse;
import com.workpulse.ems.dto.response.DepartmentSummaryResponse;
import com.workpulse.ems.dto.response.EmployeeResponse;
import com.workpulse.ems.dto.response.UserResponse;
import com.workpulse.ems.entity.Attendance;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.enums.AttendanceStatus;
import com.workpulse.ems.exception.BadRequestException;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.exception.ResourceNotFoundException;
import com.workpulse.ems.repository.AttendanceRepository;
import com.workpulse.ems.repository.EmployeeRepository;
import com.workpulse.ems.security.services.UserDetailsImpl;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeProvisioningService employeeProvisioningService;

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getAttendanceRecords(
            Long employeeId,
            LocalDate date,
            LocalDate startDate,
            LocalDate endDate,
            AttendanceStatus status,
            Pageable pageable) {

        Specification<Attendance> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (employeeId != null) {
                predicates.add(cb.equal(root.get("employee").get("id"), employeeId));
            }
            if (date != null) {
                predicates.add(cb.equal(root.get("attendanceDate"), date));
            }
            if (startDate != null && endDate != null) {
                predicates.add(cb.between(root.get("attendanceDate"), startDate, endDate));
            } else if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("attendanceDate"), startDate));
            } else if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("attendanceDate"), endDate));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return attendanceRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long id, UserDetailsImpl userDetails) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        boolean isAdminOrHr = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"));

        if (!isAdminOrHr) {
            Long userEmpId = userDetails.getEmployeeId();
            if (userEmpId == null || !Objects.equals(userEmpId, attendance.getEmployee().getId())) {
                throw new AccessDeniedException("Access denied: You can only view your own attendance record");
            }
        }

        return mapToResponse(attendance);
    }

    @Override
    @Transactional
    public Page<AttendanceResponse> getMyAttendance(UserDetailsImpl userDetails, Pageable pageable) {
        Employee employee = employeeProvisioningService.getOrCreateEmployeeForUserId(userDetails.getId());
        Long employeeId = employee.getId();

        Specification<Attendance> spec = (root, query, cb) ->
                cb.equal(root.get("employee").get("id"), employeeId);

        return attendanceRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public AttendanceResponse createAttendance(AttendanceRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(request.getEmployeeId(), request.getAttendanceDate())) {
            throw new DuplicateResourceException("Attendance record already exists for employee ID " +
                    request.getEmployeeId() + " on " + request.getAttendanceDate());
        }

        validateCheckTimes(request.getCheckIn(), request.getCheckOut());

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .attendanceDate(request.getAttendanceDate())
                .status(request.getStatus())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .remarks(request.getRemarks())
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        if (!Objects.equals(attendance.getEmployee().getId(), request.getEmployeeId()) ||
                !attendance.getAttendanceDate().equals(request.getAttendanceDate())) {
            if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(request.getEmployeeId(), request.getAttendanceDate())) {
                throw new DuplicateResourceException("Attendance record already exists for employee ID " +
                        request.getEmployeeId() + " on " + request.getAttendanceDate());
            }
        }

        validateCheckTimes(request.getCheckIn(), request.getCheckOut());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setStatus(request.getStatus());
        attendance.setCheckIn(request.getCheckIn());
        attendance.setCheckOut(request.getCheckOut());
        attendance.setRemarks(request.getRemarks());

        Attendance updated = attendanceRepository.save(attendance);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));
        attendanceRepository.delete(attendance);
    }

    @Override
    @Transactional
    public AttendanceResponse checkIn(UserDetailsImpl userDetails) {
        Employee employee = employeeProvisioningService.getOrCreateEmployeeForUserId(userDetails.getId());
        Long employeeId = employee.getId();

        LocalDate today = LocalDate.now();
        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(employeeId, today)) {
            throw new DuplicateResourceException("Attendance record already exists for today");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .attendanceDate(today)
                .status(AttendanceStatus.PRESENT)
                .checkIn(LocalTime.now())
                .remarks("Self check-in")
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse checkOut(UserDetailsImpl userDetails) {
        Employee employee = employeeProvisioningService.getOrCreateEmployeeForUserId(userDetails.getId());
        Long employeeId = employee.getId();

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("No attendance check-in record found for today"));

        if (attendance.getCheckIn() == null) {
            throw new BadRequestException("Check-in required before check-out");
        }

        if (attendance.getCheckOut() != null) {
            throw new BadRequestException("Already checked out for today");
        }

        attendance.setCheckOut(LocalTime.now());
        Attendance updated = attendanceRepository.save(attendance);
        return mapToResponse(updated);
    }

    private void validateCheckTimes(LocalTime checkIn, LocalTime checkOut) {
        if (checkIn != null && checkOut != null && checkOut.isBefore(checkIn)) {
            throw new BadRequestException("Check-out time cannot be earlier than check-in time");
        }
    }

    private AttendanceResponse mapToResponse(Attendance att) {
        Employee emp = att.getEmployee();

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

        EmployeeResponse empResp = EmployeeResponse.builder()
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

        return AttendanceResponse.builder()
                .id(att.getId())
                .employee(empResp)
                .attendanceDate(att.getAttendanceDate())
                .status(att.getStatus())
                .checkIn(att.getCheckIn())
                .checkOut(att.getCheckOut())
                .remarks(att.getRemarks())
                .createdAt(att.getCreatedAt())
                .updatedAt(att.getUpdatedAt())
                .build();
    }
}
