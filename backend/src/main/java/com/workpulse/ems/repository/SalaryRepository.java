package com.workpulse.ems.repository;

import com.workpulse.ems.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long>, JpaSpecificationExecutor<Salary> {

    Optional<Salary> findByEmployeeIdAndSalaryMonth(Long employeeId, String salaryMonth);

    List<Salary> findByEmployeeId(Long employeeId);

    List<Salary> findBySalaryMonth(String salaryMonth);

    boolean existsByEmployeeIdAndSalaryMonth(Long employeeId, String salaryMonth);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(s.netSalary), 0) FROM Salary s")
    java.math.BigDecimal sumTotalPayroll();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(s.netSalary), 0) FROM Salary s WHERE s.paymentStatus = :paymentStatus")
    java.math.BigDecimal sumTotalPayrollByStatus(@org.springframework.data.repository.query.Param("paymentStatus") com.workpulse.ems.entity.enums.PaymentStatus paymentStatus);

    long countByPaymentStatus(com.workpulse.ems.entity.enums.PaymentStatus paymentStatus);

    Optional<Salary> findTopByEmployeeIdOrderBySalaryMonthDesc(Long employeeId);
}
