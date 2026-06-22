package com.ai.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtsAnalysisRequest {
    private String resumeText;
    private String jobDescription;
}
