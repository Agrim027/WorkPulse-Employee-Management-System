package com.workpulse.ems.repository;

import com.workpulse.ems.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByDepartmentCode(String departmentCode);

    Optional<Department> findByName(String name);

    boolean existsByDepartmentCode(String departmentCode);

    boolean existsByName(String name);
}
