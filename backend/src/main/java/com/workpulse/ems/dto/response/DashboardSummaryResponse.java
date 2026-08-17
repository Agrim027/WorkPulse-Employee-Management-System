package com.workpulse.ems.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private EmployeeStats employees;
    private DepartmentStats departments;
    private AttendanceStats attendance;
    private SalaryStats salary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeStats {
        private long total;
        private long active;
        private long inactive;
        private long terminated;
        private long onLeave;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStats {
        private long total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceStats {
        private LocalDate date;
        private long present;
        private long absent;
        private long halfDay;
        private long leave;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryStats {
        private long totalRecords;
        private BigDecimal totalPayroll;
        private BigDecimal paidAmount;
        private BigDecimal pendingAmount;
        private BigDecimal cancelledAmount;
    }
}
