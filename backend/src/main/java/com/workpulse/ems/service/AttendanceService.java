package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.AttendanceRequest;
import com.workpulse.ems.dto.response.AttendanceResponse;
import com.workpulse.ems.entity.enums.AttendanceStatus;
import com.workpulse.ems.security.services.UserDetailsImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AttendanceService {

    Page<AttendanceResponse> getAttendanceRecords(
            Long employeeId,
            LocalDate date,
            LocalDate startDate,
            LocalDate endDate,
            AttendanceStatus status,
            Pageable pageable
    );

    AttendanceResponse getAttendanceById(Long id, UserDetailsImpl userDetails);

    Page<AttendanceResponse> getMyAttendance(UserDetailsImpl userDetails, Pageable pageable);

    AttendanceResponse createAttendance(AttendanceRequest request);

    AttendanceResponse updateAttendance(Long id, AttendanceRequest request);

    void deleteAttendance(Long id);

    AttendanceResponse checkIn(UserDetailsImpl userDetails);

    AttendanceResponse checkOut(UserDetailsImpl userDetails);
}
