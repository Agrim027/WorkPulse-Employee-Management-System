package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.EmployeeRequest;
import com.workpulse.ems.dto.response.EmployeeResponse;
import com.workpulse.ems.entity.enums.EmploymentStatus;
import com.workpulse.ems.security.services.UserDetailsImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {

    Page<EmployeeResponse> getEmployees(String search, Long departmentId, EmploymentStatus status, Pageable pageable);

    EmployeeResponse getEmployeeById(Long id, UserDetailsImpl userDetails);

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    void deleteEmployee(Long id);
}
