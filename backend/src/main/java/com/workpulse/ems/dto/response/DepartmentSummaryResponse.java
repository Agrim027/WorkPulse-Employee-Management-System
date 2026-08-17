package com.workpulse.ems.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentSummaryResponse {

    private Long id;

    private String departmentCode;

    private String name;
}
