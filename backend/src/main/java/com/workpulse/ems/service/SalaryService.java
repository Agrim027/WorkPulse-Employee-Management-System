package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.SalaryRequest;
import com.workpulse.ems.dto.response.SalaryResponse;
import com.workpulse.ems.entity.enums.PaymentStatus;
import com.workpulse.ems.security.services.UserDetailsImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SalaryService {

    Page<SalaryResponse> getSalaries(
            Long employeeId,
            String salaryMonth,
            PaymentStatus paymentStatus,
            Pageable pageable
    );

    SalaryResponse getSalaryById(Long id, UserDetailsImpl userDetails);

    Page<SalaryResponse> getMySalaries(UserDetailsImpl userDetails, Pageable pageable);

    SalaryResponse createSalary(SalaryRequest request);

    SalaryResponse updateSalary(Long id, SalaryRequest request);

    void deleteSalary(Long id);
}
