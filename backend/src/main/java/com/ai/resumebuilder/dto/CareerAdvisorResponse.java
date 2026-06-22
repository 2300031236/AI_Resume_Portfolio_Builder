package com.ai.resumebuilder.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerAdvisorResponse {
    private List<String> jobRoles;
    private List<String> learningPaths;
    private List<String> missingSkills;
    private List<String> certificationsToPursue;
    private List<String> preparationTips;
}
