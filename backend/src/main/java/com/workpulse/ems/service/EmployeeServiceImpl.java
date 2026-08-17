package com.workpulse.ems.service;

import com.workpulse.ems.dto.request.EmployeeRequest;
import com.workpulse.ems.dto.response.DepartmentSummaryResponse;
import com.workpulse.ems.dto.response.EmployeeResponse;
import com.workpulse.ems.dto.response.UserResponse;
import com.workpulse.ems.entity.Department;
import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.User;
import com.workpulse.ems.entity.enums.EmploymentStatus;
import com.workpulse.ems.exception.DuplicateResourceException;
import com.workpulse.ems.exception.ResourceNotFoundException;
import com.workpulse.ems.repository.DepartmentRepository;
import com.workpulse.ems.repository.EmployeeRepository;
import com.workpulse.ems.repository.UserRepository;
import com.workpulse.ems.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployees(String search, Long departmentId, EmploymentStatus status, Pageable pageable) {
        // Simple paginated search filter
        return employeeRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id, UserDetailsImpl userDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        // IDOR Guard: EMPLOYEE role can ONLY access their own profile
        boolean isAdminOrHr = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"));

        if (!isAdminOrHr) {
            if (userDetails.getEmployeeId() == null || !Objects.equals(userDetails.getEmployeeId(), id)) {
                throw new AccessDeniedException("Access denied: You can only view your own employee profile");
            }
        }

        return mapToResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new DuplicateResourceException("Employee code '" + request.getEmployeeCode() + "' already exists");
        }

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee email '" + request.getEmail() + "' already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

            if (employeeRepository.findByUserId(request.getUserId()).isPresent()) {
                throw new DuplicateResourceException("User id '" + request.getUserId() + "' is already assigned to another employee");
            }
        }

        Employee employee = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .joiningDate(request.getJoiningDate())
                .employmentStatus(request.getEmploymentStatus())
                .department(department)
                .user(user)
                .build();

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (!employee.getEmployeeCode().equalsIgnoreCase(request.getEmployeeCode()) &&
                employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new DuplicateResourceException("Employee code '" + request.getEmployeeCode() + "' already exists");
        }

        if (!employee.getEmail().equalsIgnoreCase(request.getEmail()) &&
                employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee email '" + request.getEmail() + "' already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

            var existingEmployeeWithUser = employeeRepository.findByUserId(request.getUserId());
            if (existingEmployeeWithUser.isPresent() && !Objects.equals(existingEmployeeWithUser.get().getId(), id)) {
                throw new DuplicateResourceException("User id '" + request.getUserId() + "' is already assigned to another employee");
            }
        }

        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setGender(request.getGender());
        employee.setAddress(request.getAddress());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setEmploymentStatus(request.getEmploymentStatus());
        employee.setDepartment(department);
        employee.setUser(user);

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        // Soft deletion preserves referential integrity with Attendance and Salary records
        employee.setEmploymentStatus(EmploymentStatus.TERMINATED);
        employeeRepository.save(employee);
    }

    private EmployeeResponse mapToResponse(Employee emp) {
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

        return EmployeeResponse.builder()
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
    }
}
