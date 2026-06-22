package com.ai.resumebuilder.controller;

import com.ai.resumebuilder.dto.CoverLetterRequest;
import com.ai.resumebuilder.service.HuggingFaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/cover-letters")
public class CoverLetterController {

    @Autowired
    private HuggingFaceService huggingFaceService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateCoverLetter(@RequestBody CoverLetterRequest request) {
        String prompt = String.format(
                "Write a highly professional and compelling cover letter for a candidate applying to '%s' as a '%s'. " +
                "The target Job Description is: '%s'. " +
                "Align the letter to showcase technical skills (like Java, React, SQL), project accomplishments, " +
                "and explain why they would be a great fit for the company. Keep the letter to 3-4 paragraphs.",
                request.getCompanyName(), request.getJobRole(), request.getJobDescription()
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("coverLetter", result));
    }

    @PostMapping("/internship")
    public ResponseEntity<?> generateInternshipLetter(@RequestBody CoverLetterRequest request) {
        String prompt = String.format(
                "Write a polite and eager internship application letter for a college student applying to '%s' for a '%s' internship. " +
                "The Job Description is: '%s'. " +
                "Highlight active learning mindset, academic projects, and enthusiasm to learn from senior engineers. " +
                "Keep it concise and professional.",
                request.getCompanyName(), request.getJobRole(), request.getJobDescription()
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("internshipLetter", result));
    }

    @PostMapping("/follow-up")
    public ResponseEntity<?> generateFollowUpEmail(@RequestBody CoverLetterRequest request) {
        String prompt = String.format(
                "Write a short, polite, and professional follow-up email to send to the recruiter or hiring manager at '%s' " +
                "regarding the '%s' position. The applicant applied a week ago. " +
                "Express continued interest and ask if there are any updates regarding their application. " +
                "Keep the email brief (approx 100 words) with a clear Subject line.",
                request.getCompanyName(), request.getJobRole()
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("followUpEmail", result));
    }
}
