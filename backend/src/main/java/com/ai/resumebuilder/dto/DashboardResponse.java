package com.ai.resumebuilder.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private String welcomeMessage;
    private long resumeCount;
    private long portfolioCount;
    private int avgAtsScore;
    private List<String> recentActivity;
    private List<String> careerRecommendations;
}
