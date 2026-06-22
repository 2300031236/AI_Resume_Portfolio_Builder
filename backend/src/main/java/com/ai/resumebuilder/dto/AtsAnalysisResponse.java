package com.ai.resumebuilder.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsAnalysisResponse {
    private Integer atsScore;
    private List<String> missingKeywords;
    private Double keywordMatchPercentage;
    private List<String> improvementSuggestions;
}
