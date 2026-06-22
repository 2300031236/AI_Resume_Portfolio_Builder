package com.ai.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeRequest {
    private String template;
    private Integer atsScore;
    private String resumeData; // JSON representation of resume content
}
