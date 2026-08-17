package com.workpulse.ems.dto.response;

import com.workpulse.ems.entity.enums.EmploymentStatus;
import com.workpulse.ems.entity.enums.Gender;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private Long id;

    private String employeeCode;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private LocalDate dateOfBirth;

    private Gender gender;

    private String address;

    private LocalDate joiningDate;

    private EmploymentStatus employmentStatus;

    private DepartmentSummaryResponse department;

    private UserResponse user;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
