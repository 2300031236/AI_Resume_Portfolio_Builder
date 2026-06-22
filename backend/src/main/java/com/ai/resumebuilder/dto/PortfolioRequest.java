package com.ai.resumebuilder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioRequest {
    private String theme;
    private String portfolioData; // JSON representation of portfolio content
}
