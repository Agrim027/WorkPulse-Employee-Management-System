package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.SalaryRequest;
import com.workpulse.ems.dto.response.DepartmentSummaryResponse;
import com.workpulse.ems.dto.response.EmployeeResponse;
import com.workpulse.ems.dto.response.SalaryResponse;
import com.workpulse.ems.dto.response.UserResponse;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.Salary;
import com.workpulse.ems.entity.enums.PaymentStatus;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.exception.ResourceNotFoundException;
import com.workpulse.ems.repository.EmployeeRepository;
import com.workpulse.ems.repository.SalaryRepository;
import com.workpulse.ems.security.services.UserDetailsImpl;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryServiceImpl implements SalaryService {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeProvisioningService employeeProvisioningService;

    @Override
    @Transactional(readOnly = true)
    public Page<SalaryResponse> getSalaries(
            Long employeeId,
            String salaryMonth,
            PaymentStatus paymentStatus,
            Pageable pageable) {

        Specification<Salary> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (employeeId != null) {
                predicates.add(cb.equal(root.get("employee").get("id"), employeeId));
            }
            if (salaryMonth != null && !salaryMonth.isBlank()) {
                predicates.add(cb.equal(root.get("salaryMonth"), salaryMonth));
            }
            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return salaryRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SalaryResponse getSalaryById(Long id, UserDetailsImpl userDetails) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salary record not found with id: " + id));

        boolean isAdminOrHr = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"));

        if (!isAdminOrHr) {
            Long userEmpId = userDetails.getEmployeeId();
            if (userEmpId == null || !Objects.equals(userEmpId, salary.getEmployee().getId())) {
                throw new AccessDeniedException("Access denied: You can only view your own salary record");
            }
        }

        return mapToResponse(salary);
    }

    @Override
    @Transactional
    public Page<SalaryResponse> getMySalaries(UserDetailsImpl userDetails, Pageable pageable) {
        Employee employee = employeeProvisioningService.getOrCreateEmployeeForUserId(userDetails.getId());
        Long employeeId = employee.getId();

        Specification<Salary> spec = (root, query, cb) ->
                cb.equal(root.get("employee").get("id"), employeeId);

        return salaryRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public SalaryResponse createSalary(SalaryRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        if (salaryRepository.existsByEmployeeIdAndSalaryMonth(request.getEmployeeId(), request.getSalaryMonth())) {
            throw new DuplicateResourceException("Salary record already exists for employee ID " +
                    request.getEmployeeId() + " for month " + request.getSalaryMonth());
        }

        BigDecimal netSalary = calculateNetSalary(request.getBasicSalary(), request.getAllowances(), request.getDeductions());
        LocalDate paymentDate = resolvePaymentDate(request.getPaymentStatus(), request.getPaymentDate());

        Salary salary = Salary.builder()
                .employee(employee)
                .basicSalary(request.getBasicSalary())
                .allowances(request.getAllowances())
                .deductions(request.getDeductions())
                .netSalary(netSalary)
                .salaryMonth(request.getSalaryMonth())
                .paymentStatus(request.getPaymentStatus())
                .paymentDate(paymentDate)
                .build();

        Salary saved = salaryRepository.save(salary);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SalaryResponse updateSalary(Long id, SalaryRequest request) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salary record not found with id: " + id));

        if (!Objects.equals(salary.getEmployee().getId(), request.getEmployeeId()) ||
                !salary.getSalaryMonth().equalsIgnoreCase(request.getSalaryMonth())) {
            if (salaryRepository.existsByEmployeeIdAndSalaryMonth(request.getEmployeeId(), request.getSalaryMonth())) {
                throw new DuplicateResourceException("Salary record already exists for employee ID " +
                        request.getEmployeeId() + " for month " + request.getSalaryMonth());
            }
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        BigDecimal netSalary = calculateNetSalary(request.getBasicSalary(), request.getAllowances(), request.getDeductions());
        LocalDate paymentDate = resolvePaymentDate(request.getPaymentStatus(), request.getPaymentDate());

        salary.setEmployee(employee);
        salary.setBasicSalary(request.getBasicSalary());
        salary.setAllowances(request.getAllowances());
        salary.setDeductions(request.getDeductions());
        salary.setNetSalary(netSalary);
        salary.setSalaryMonth(request.getSalaryMonth());
        salary.setPaymentStatus(request.getPaymentStatus());
        salary.setPaymentDate(paymentDate);

        Salary updated = salaryRepository.save(salary);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSalary(Long id) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salary record not found with id: " + id));
        salaryRepository.delete(salary);
    }

    private BigDecimal calculateNetSalary(BigDecimal basic, BigDecimal allowances, BigDecimal deductions) {
        return basic.add(allowances).subtract(deductions);
    }

    private LocalDate resolvePaymentDate(PaymentStatus status, LocalDate date) {
        if (status == PaymentStatus.PAID && date == null) {
            return LocalDate.now();
        }
        return date;
    }

    private SalaryResponse mapToResponse(Salary sal) {
        Employee emp = sal.getEmployee();

        DepartmentSummaryResponse deptSummary = null;
        if (emp.getDepartment() != null) {
            deptSummary = DepartmentSummaryResponse.builder()
                    .id(emp.getDepartment().getId())
                    .departmentCode(emp.getDepartment().getDepartmentCode())
                    .name(emp.getDepartment().getName())
                    .build();
        }

        UserResponse userSummary = null;
        if (emp.getUser() != null) {
            List<String> roles = emp.getUser().getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toList());

            userSummary = UserResponse.builder()
                    .id(emp.getUser().getId())
                    .username(emp.getUser().getUsername())
                    .email(emp.getUser().getEmail())
                    .enabled(emp.getUser().isEnabled())
                    .roles(roles)
                    .employeeId(emp.getId())
                    .build();
        }

        EmployeeResponse empResp = EmployeeResponse.builder()
                .id(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .dateOfBirth(emp.getDateOfBirth())
                .gender(emp.getGender())
                .address(emp.getAddress())
                .joiningDate(emp.getJoiningDate())
                .employmentStatus(emp.getEmploymentStatus())
                .department(deptSummary)
                .user(userSummary)
                .createdAt(emp.getCreatedAt())
                .updatedAt(emp.getUpdatedAt())
                .build();

        return SalaryResponse.builder()
                .id(sal.getId())
                .employee(empResp)
                .basicSalary(sal.getBasicSalary())
                .allowances(sal.getAllowances())
                .deductions(sal.getDeductions())
                .netSalary(sal.getNetSalary())
                .salaryMonth(sal.getSalaryMonth())
                .paymentStatus(sal.getPaymentStatus())
                .paymentDate(sal.getPaymentDate())
                .createdAt(sal.getCreatedAt())
                .updatedAt(sal.getUpdatedAt())
                .build();
    }
}
