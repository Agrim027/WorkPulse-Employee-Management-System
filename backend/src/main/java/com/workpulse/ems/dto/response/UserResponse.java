package com.workpulse.ems.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private boolean enabled;

    private List<String> roles;

    private Long employeeId;
}
