package com.workpulse.ems.dto.response;

import com.workpulse.ems.entity.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private Long id;
    private EmployeeResponse employee;
    private LocalDate attendanceDate;
    private AttendanceStatus status;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
