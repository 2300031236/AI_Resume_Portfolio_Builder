package com.ai.resumebuilder.controller;

import com.ai.resumebuilder.service.HuggingFaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-tools")
public class AiToolsController {

    @Autowired
    private HuggingFaceService huggingFaceService;

    @PostMapping("/linkedin-headline")
    public ResponseEntity<?> generateLinkedInHeadline(@RequestBody Map<String, String> request) {
        String role = request.getOrDefault("role", "Software Engineer");
        String skills = request.getOrDefault("skills", "Java, React");

        String prompt = String.format(
                "You are a professional brand advisor. Generate 3 unique, eye-catching, and SEO-friendly LinkedIn Headlines " +
                "for a fresh graduate looking for a '%s' position. Key skills are: '%s'. " +
                "Use modern divider formats (e.g. '|' or '•') and keep them under 180 characters each.",
                role, skills
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("headlines", result));
    }

    @PostMapping("/linkedin-about")
    public ResponseEntity<?> generateLinkedInAbout(@RequestBody Map<String, String> request) {
        String name = request.getOrDefault("name", "Student");
        String role = request.getOrDefault("role", "Software Developer");
        String skills = request.getOrDefault("skills", "Java, React, SQL");
        String experience = request.getOrDefault("experience", "Academic projects and internship experience");

        String prompt = String.format(
                "Write a compelling, professional, and friendly LinkedIn 'About' section for '%s', " +
                "who is an aspiring '%s'. Tech stack: '%s'. Notable experience: '%s'. " +
                "Include a polite call-to-action, a list of core competencies, and write in the first person. " +
                "Keep it engaging and split it into readable paragraphs.",
                name, role, skills, experience
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("about", result));
    }

    @PostMapping("/github-description")
    public ResponseEntity<?> generateGithubDescription(@RequestBody Map<String, String> request) {
        String projectTitle = request.getOrDefault("projectTitle", "AI Project");
        String techStack = request.getOrDefault("techStack", "React, Spring Boot, MySQL");
        String features = request.getOrDefault("features", "Authentication, CRUD, AI Advice");

        String prompt = String.format(
                "Write a professional GitHub repository description and brief README introduction for the project: '%s'. " +
                "Technologies: '%s'. Core features: '%s'. " +
                "Provide a 1-sentence description suitable for the GitHub description box, followed by a structured " +
                "'Key Features' and 'Tech Stack' markdown snippet for the README.",
                projectTitle, techStack, features
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("description", result));
    }

    @PostMapping("/interview-questions")
    public ResponseEntity<?> generateInterviewQuestions(@RequestBody Map<String, String> request) {
        String role = request.getOrDefault("role", "Software Engineer");
        String skills = request.getOrDefault("skills", "Java, React");

        String prompt = String.format(
                "Generate 5 mock technical interview questions tailored for a fresh graduate applying for a '%s' role. " +
                "Focus on the tech stack: '%s'. " +
                "Include a mixture of basic coding logic, conceptual framework questions, and database queries.",
                role, skills
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("questions", result));
    }

    @PostMapping("/interview-prep/hr")
    public ResponseEntity<?> getHrPrepTips(@RequestBody Map<String, String> request) {
        String prompt = 
                "Provide a quick-reference guide for a student preparing for HR behavioral interviews. " +
                "Include 3 common HR questions (e.g. 'Tell me about yourself', 'Handling a conflict', 'Strengths & weaknesses'), " +
                "with structured guidelines on how to frame responses using the STAR method, and common pitfalls to avoid.";

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("prepGuide", result));
    }

    @PostMapping("/interview-prep/technical")
    public ResponseEntity<?> getTechnicalPrepTips(@RequestBody Map<String, String> request) {
        String targetRole = request.getOrDefault("role", "Full-Stack Engineer");

        String prompt = String.format(
                "Provide a comprehensive technical interview preparation study path for a fresh graduate aiming for a '%s' position. " +
                "Break it down into: Data Structures & Algorithms, System Design basics, Core Language/Framework fundamentals, and Database topics. " +
                "Include specific action items and online practice strategies.",
                targetRole
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("prepGuide", result));
    }
}
