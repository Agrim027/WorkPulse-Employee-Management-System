package com.workpulse.ems.dto.request;

import com.workpulse.ems.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
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
public class SalaryRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Basic salary is required")
    @PositiveOrZero(message = "Basic salary cannot be negative")
    private BigDecimal basicSalary;

    @NotNull(message = "Allowances are required")
    @PositiveOrZero(message = "Allowances cannot be negative")
    private BigDecimal allowances;

    @NotNull(message = "Deductions are required")
    @PositiveOrZero(message = "Deductions cannot be negative")
    private BigDecimal deductions;

    @NotBlank(message = "Salary month is required")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Salary month must be in YYYY-MM format")
    private String salaryMonth;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private LocalDate paymentDate;
}
