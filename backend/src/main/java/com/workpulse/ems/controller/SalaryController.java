package com.workpulse.ems.controller;

import com.workpulse.ems.dto.request.SalaryRequest;
import com.workpulse.ems.dto.response.ApiResponse;
import com.workpulse.ems.dto.response.SalaryResponse;
import com.workpulse.ems.entity.enums.PaymentStatus;
import com.workpulse.ems.security.services.UserDetailsImpl;
import com.workpulse.ems.service.SalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/salaries")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<SalaryResponse>>> getSalaries(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String salaryMonth,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "salaryMonth,desc") String[] sort) {

        Sort.Direction direction = sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));

        Page<SalaryResponse> records = salaryService.getSalaries(employeeId, salaryMonth, paymentStatus, pageable);
        return ResponseEntity.ok(ApiResponse.success("Salary records retrieved successfully", records));
    }

    @GetMapping("/my-salaries")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<SalaryResponse>>> getMySalaries(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "salaryMonth,desc") String[] sort) {

        Sort.Direction direction = sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));

        Page<SalaryResponse> records = salaryService.getMySalaries(userDetails, pageable);
        return ResponseEntity.ok(ApiResponse.success("Personal salary records retrieved successfully", records));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SalaryResponse>> getSalaryById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        SalaryResponse record = salaryService.getSalaryById(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Salary record retrieved successfully", record));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<SalaryResponse>> createSalary(@Valid @RequestBody SalaryRequest request) {
        SalaryResponse created = salaryService.createSalary(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Salary record created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<SalaryResponse>> updateSalary(
            @PathVariable Long id,
            @Valid @RequestBody SalaryRequest request) {

        SalaryResponse updated = salaryService.updateSalary(id, request);
        return ResponseEntity.ok(ApiResponse.success("Salary record updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Void>> deleteSalary(@PathVariable Long id) {
        salaryService.deleteSalary(id);
        return ResponseEntity.ok(ApiResponse.success("Salary record deleted successfully"));
    }
}
