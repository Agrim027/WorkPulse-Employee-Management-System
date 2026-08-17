package com.workpulse.ems.service;

import com.workpulse.ems.dto.response.DashboardSummaryResponse;
import com.workpulse.ems.dto.response.EmployeeDashboardSummaryResponse;

public interface DashboardService {
    DashboardSummaryResponse getAdminSummary();
    EmployeeDashboardSummaryResponse getEmployeeSummary(String username);
}
