package com.workpulse.ems.security.services;

import com.workpulse.ems.entity.Employee;
import com.workpulse.ems.entity.User;
import com.workpulse.ems.repository.EmployeeRepository;
import com.workpulse.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + username)));

        Long employeeId = employeeRepository.findByUserId(user.getId())
                .map(Employee::getId)
                .orElse(null);

        return UserDetailsImpl.build(user, employeeId);
    }
}
