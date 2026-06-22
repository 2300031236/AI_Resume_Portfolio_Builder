package com.ai.resumebuilder.controller;

import com.ai.resumebuilder.dto.PortfolioRequest;
import com.ai.resumebuilder.model.Portfolio;
import com.ai.resumebuilder.security.UserDetailsImpl;
import com.ai.resumebuilder.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    // Secure endpoint: get logged-in user's portfolio configuration
    @GetMapping("/api/portfolios")
    public ResponseEntity<?> getMyPortfolio(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Portfolio portfolio = portfolioService.getPortfolioByUserId(userDetails.getId());
        return ResponseEntity.ok(portfolio);
    }

    // Secure endpoint: save/update logged-in user's portfolio configuration
    @PostMapping("/api/portfolios")
    public ResponseEntity<?> savePortfolio(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody PortfolioRequest request) {
        Portfolio portfolio = portfolioService.savePortfolio(userDetails.getId(), request);
        return ResponseEntity.ok(portfolio);
    }

    // Public endpoint: retrieve portfolio config for public preview sharing
    @GetMapping("/api/public/portfolios/{userId}")
    public ResponseEntity<?> getPublicPortfolio(@PathVariable Long userId) {
        Portfolio portfolio = portfolioService.getPortfolioByUserId(userId);
        return ResponseEntity.ok(portfolio);
    }
}
