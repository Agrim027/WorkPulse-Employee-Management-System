package com.workpulse.ems.controller;

import com.workpulse.ems.dto.response.ApiResponse;
import com.workpulse.ems.dto.response.DashboardSummaryResponse;
import com.workpulse.ems.dto.response.EmployeeDashboardSummaryResponse;
import com.workpulse.ems.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getAdminSummary() {
        DashboardSummaryResponse summary = dashboardService.getAdminSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved successfully", summary));
    }

    @GetMapping("/my-summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployeeDashboardSummaryResponse>> getEmployeeSummary(Authentication authentication) {
        String username = authentication.getName();
        EmployeeDashboardSummaryResponse summary = dashboardService.getEmployeeSummary(username);
        return ResponseEntity.ok(ApiResponse.success("Employee summary retrieved successfully", summary));
    }
}
