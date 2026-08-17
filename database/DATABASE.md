# WorkPulse EMS Database Documentation

This document describes the relational database design, tables, constraints, and indexing strategy for the **WorkPulse Employee Management System**.

---

## 1. Entity Relationship Diagram Summary

```
ROLES (1) <--- (N) USER_ROLES (N) ---> (1) USERS (1) <--- (0..1) EMPLOYEES
                                                              |
    +---------------------------------------------------------+
    |                      |                         |
(N) v                  (N) v                     (N) v
DEPARTMENTS            ATTENDANCE                SALARIES
```

---

## 2. Table Specifications

### 2.1 `roles`
* **Purpose**: System security roles (`ROLE_ADMIN`, `ROLE_HR`, `ROLE_EMPLOYEE`).
* **Primary Key**: `id` (`BIGSERIAL`)
* **Unique Constraint**: `uk_roles_name` on `name` (`VARCHAR(30)`)
* **Columns**: `id`, `name`, `description`, `created_at`, `updated_at`

### 2.2 `users`
* **Purpose**: User credentials for system login.
* **Primary Key**: `id` (`BIGSERIAL`)
* **Unique Constraints**: 
  * `uk_users_username` on `username` (`VARCHAR(50)`)
  * `uk_users_email` on `email` (`VARCHAR(100)`)
* **Columns**: `id`, `username`, `email`, `password`, `enabled`, `created_at`, `updated_at`

### 2.3 `user_roles`
* **Purpose**: Many-to-Many join table mapping users to roles.
* **Primary Key**: (`user_id`, `role_id`)
* **Foreign Keys**: 
  * `user_id` -> `users(id)` ON DELETE CASCADE
  * `role_id` -> `roles(id)` ON DELETE CASCADE

### 2.4 `departments`
* **Purpose**: Organizational departments (e.g., IT, HR, Finance).
* **Primary Key**: `id` (`BIGSERIAL`)
* **Unique Constraints**:
  * `uk_dept_code` on `department_code` (`VARCHAR(20)`)
  * `uk_dept_name` on `name` (`VARCHAR(100)`)
* **Columns**: `id`, `department_code`, `name`, `description`, `created_at`, `updated_at`

### 2.5 `employees`
* **Purpose**: Employee master records.
* **Primary Key**: `id` (`BIGSERIAL`)
* **Foreign Keys**:
  * `department_id` -> `departments(id)` (Many-to-One)
  * `user_id` -> `users(id)` (One-to-One, Optional)
* **Unique Constraints**:
  * `uk_emp_code` on `employee_code` (`VARCHAR(20)`)
  * `uk_emp_email` on `email` (`VARCHAR(100)`)
  * `uk_emp_user_id` on `user_id` (`BIGINT`)
* **Indexes**:
  * `idx_emp_code` on `(employee_code)`
  * `idx_emp_dept` on `(department_id)`

### 2.6 `attendance`
* **Purpose**: Daily employee attendance logs.
* **Primary Key**: `id` (`BIGSERIAL`)
* **Foreign Key**: `employee_id` -> `employees(id)` ON DELETE CASCADE
* **Compound Unique Constraint**: `uk_emp_attendance_date` on `(employee_id, attendance_date)`
* **Index**: `idx_attendance_emp_date` on `(employee_id, attendance_date)`

### 2.7 `salaries`
* **Purpose**: Monthly payroll slips and salary calculations.
* **Primary Key**: `id` (`BIGSERIAL`)
* **Foreign Key**: `employee_id` -> `employees(id)` ON DELETE CASCADE
* **Compound Unique Constraint**: `uk_emp_salary_month` on `(employee_id, salary_month)`
* **Index**: `idx_salary_emp_month` on `(employee_id, salary_month)`
* **Net Salary Calculation Formula**:
  $$\text{net\_salary} = \text{basic\_salary} + \text{allowances} - \text{deductions}$$
