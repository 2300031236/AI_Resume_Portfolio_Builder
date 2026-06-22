package com.ai.resumebuilder.controller;

import com.ai.resumebuilder.dto.CareerAdvisorResponse;
import com.ai.resumebuilder.model.*;
import com.ai.resumebuilder.repository.*;
import com.ai.resumebuilder.security.UserDetailsImpl;
import com.ai.resumebuilder.service.HuggingFaceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/career-advisor")
public class CareerAdvisorController {
    private static final Logger logger = LoggerFactory.getLogger(CareerAdvisorController.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private HuggingFaceService huggingFaceService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();

        // 1. Gather all profile info from database tables
        List<Education> edus = educationRepository.findByUserId(userId);
        List<Project> projs = projectRepository.findByUserId(userId);
        List<Certification> certs = certificationRepository.findByUserId(userId);

        StringBuilder profileSummary = new StringBuilder();
        profileSummary.append("Candidate Profile:\n");
        
        if (!edus.isEmpty()) {
            profileSummary.append("- Education: ");
            for (Education e : edus) {
                profileSummary.append(String.format("%s from %s (Grad Year: %d); ", e.getDegree(), e.getInstitution(), e.getGraduationYear()));
            }
            profileSummary.append("\n");
        }
        
        if (!projs.isEmpty()) {
            profileSummary.append("- Projects: ");
            for (Project p : projs) {
                profileSummary.append(String.format("'%s' built using '%s'; ", p.getTitle(), p.getTechnologies()));
            }
            profileSummary.append("\n");
        }

        if (!certs.isEmpty()) {
            profileSummary.append("- Certifications: ");
            for (Certification c : certs) {
                profileSummary.append(String.format("'%s' by '%s'; ", c.getName(), c.getIssuer()));
            }
            profileSummary.append("\n");
        }

        // 2. Draft the LLM prompt
        String prompt = String.format(
                "You are an AI Career Advisor. Analyze the following candidate profile details and suggest career advice:\n\n" +
                "%s\n" +
                "Respond ONLY with a valid JSON object matching the structure below. Do not include any introduction, formatting code blocks, or extra text.\n" +
                "{\n" +
                "  \"jobRoles\": [\"Role 1\", \"Role 2\"],\n" +
                "  \"learningPaths\": [\"Path 1\", \"Path 2\"],\n" +
                "  \"missingSkills\": [\"Skill 1\", \"Skill 2\"],\n" +
                "  \"certificationsToPursue\": [\"Cert 1\", \"Cert 2\"],\n" +
                "  \"preparationTips\": [\"Tip 1\", \"Tip 2\"]\n" +
                "}",
                profileSummary.toString()
        );

        String result = huggingFaceService.generateCompletion(prompt, 0.4, 1000);

        try {
            String cleanedResult = result.trim();
            if (cleanedResult.startsWith("```json")) {
                cleanedResult = cleanedResult.substring(7);
            }
            if (cleanedResult.endsWith("```")) {
                cleanedResult = cleanedResult.substring(0, cleanedResult.length() - 3);
            }
            cleanedResult = cleanedResult.trim();

            CareerAdvisorResponse response = objectMapper.readValue(cleanedResult, CareerAdvisorResponse.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.warn("Failed to parse Career Advisor JSON response, constructing manual fallback: {}", e.getMessage());

            // Build high-quality fallback
            List<String> roles = new ArrayList<>();
            roles.add("Java Developer");
            roles.add("React Developer");
            roles.add("Software Engineer Intern");

            List<String> paths = new ArrayList<>();
            paths.add("Spring Boot REST API Development Masterclass");
            paths.add("Advanced Frontend React Routing & State Management");

            List<String> skills = new ArrayList<>();
            skills.add("Docker Containerization");
            skills.add("REST API Testing (Postman/JUnit)");
            skills.add("AWS EC2 Cloud Deployment");

            List<String> certsToGet = new ArrayList<>();
            certsToGet.add("AWS Certified Developer Associate");
            certsToGet.add("Oracle Certified Professional Java Programmer");

            List<String> tips = new ArrayList<>();
            tips.add("Solve 1-2 coding problems daily on platforms like LeetCode.");
            tips.add("Practice Mock behavioral interviews focusing on the STAR methodology (Situation, Task, Action, Result).");
            tips.add("Add a deployment link and GitHub code repository to all projects on your resume.");

            CareerAdvisorResponse fallback = CareerAdvisorResponse.builder()
                    .jobRoles(roles)
                    .learningPaths(paths)
                    .missingSkills(skills)
                    .certificationsToPursue(certsToGet)
                    .preparationTips(tips)
                    .build();

            return ResponseEntity.ok(fallback);
        }
    }
}
