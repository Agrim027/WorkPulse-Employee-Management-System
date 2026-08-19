package com.workpulse.ems.service.impl;

import com.workpulse.ems.entity.Department;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.User;
import com.workpulse.ems.entity.enums.EmploymentStatus;
import com.workpulse.ems.exception.ResourceNotFoundException;
import com.workpulse.ems.repository.DepartmentRepository;
import com.workpulse.ems.repository.EmployeeRepository;
import com.workpulse.ems.repository.UserRepository;
import com.workpulse.ems.service.EmployeeProvisioningService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmployeeProvisioningServiceImpl implements EmployeeProvisioningService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Employee getOrCreateEmployeeForUser(User user) {
        return employeeRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultEmployee(user));
    }

    @Override
    @Transactional
    public Employee getOrCreateEmployeeForUserId(Long userId) {
        return employeeRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    return createDefaultEmployee(user);
                });
    }

    @Override
    @Transactional
    public Employee getOrCreateEmployeeForUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with username or email: " + username)));
        return getOrCreateEmployeeForUser(user);
    }

    private Employee createDefaultEmployee(User user) {
        Department defaultDept = departmentRepository.findAll().stream().findFirst()
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .departmentCode("GEN")
                        .name("General")
                        .description("General Department")
                        .build()));

        String empCode = "EMP" + String.format("%04d", user.getId());

        String email = user.getEmail();
        if (email == null || email.isBlank() || employeeRepository.existsByEmail(email)) {
            email = user.getUsername().toLowerCase() + "-" + user.getId() + "@workpulse.local";
        }

        Employee employee = Employee.builder()
                .employeeCode(empCode)
                .firstName(capitalize(user.getUsername()))
                .lastName("Employee")
                .email(email)
                .joiningDate(LocalDate.now())
                .employmentStatus(EmploymentStatus.ACTIVE)
                .department(defaultDept)
                .user(user)
                .build();

        return employeeRepository.save(employee);
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return "User";
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
