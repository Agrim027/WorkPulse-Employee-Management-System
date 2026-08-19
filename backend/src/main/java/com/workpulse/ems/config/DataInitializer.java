package com.workpulse.ems.config;

import com.workpulse.ems.entity.Role;
import com.workpulse.ems.entity.User;
import com.workpulse.ems.entity.enums.ERole;
import com.workpulse.ems.repository.RoleRepository;
import com.workpulse.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // Ensure roles exist
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).description("Admin Role").build()));

        roleRepository.findByName(ERole.ROLE_HR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_HR).description("HR Role").build()));

        roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_EMPLOYEE).description("Employee Role").build()));

        // Check if user 'admin' exists and upgrade role to ROLE_ADMIN
        Optional<User> adminUserOpt = userRepository.findByUsername("admin");
        if (adminUserOpt.isPresent()) {
            User adminUser = adminUserOpt.get();
            boolean hasAdminRole = adminUser.getRoles().stream()
                    .anyMatch(r -> r.getName() == ERole.ROLE_ADMIN);

            if (!hasAdminRole) {
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                adminUser.setRoles(roles);
                userRepository.save(adminUser);
                log.info("Successfully updated 'admin' user role to ROLE_ADMIN");
            }
        }
    }
}
