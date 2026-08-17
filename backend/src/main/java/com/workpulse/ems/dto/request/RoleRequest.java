package com.workpulse.ems.dto.request;

import com.workpulse.ems.entity.enums.ERole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {

    @NotNull(message = "Role name is required")
    private ERole name;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
}
