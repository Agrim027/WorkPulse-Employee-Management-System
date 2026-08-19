package com.workpulse.ems.service;

import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.User;

public interface EmployeeProvisioningService {
    Employee getOrCreateEmployeeForUser(User user);
    Employee getOrCreateEmployeeForUserId(Long userId);
    Employee getOrCreateEmployeeForUsername(String username);
}
