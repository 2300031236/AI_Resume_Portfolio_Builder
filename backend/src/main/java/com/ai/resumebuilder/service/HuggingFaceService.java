package com.ai.resumebuilder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class HuggingFaceService {
    private static final Logger logger = LoggerFactory.getLogger(HuggingFaceService.class);

    @Value("${huggingface.api.url}")
    private String apiUrl;

    @Value("${huggingface.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateCompletion(String prompt, double temperature, int maxTokens) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Hugging Face API Key is missing. Using Mock LLM fallback.");
            return generateMockFallback(prompt);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("max_new_tokens", maxTokens);
            parameters.put("temperature", temperature);
            parameters.put("return_full_text", false);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("inputs", prompt);
            requestBody.put("parameters", parameters);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.isArray() && !root.isEmpty()) {
                    String generatedText = root.get(0).get("generated_text").asText();
                    
                    // Gemma sometimes prepends the prompt. Let's clean it if return_full_text is ignored by HF API.
                    if (generatedText.startsWith(prompt)) {
                        generatedText = generatedText.substring(prompt.length()).trim();
                    }
                    return generatedText;
                } else if (root.has("generated_text")) {
                    return root.get("generated_text").asText();
                }
                return response.getBody();
            }
        } catch (Exception e) {
            logger.error("Error calling Hugging Face API: {}. Falling back to mock generator.", e.getMessage());
        }

        return generateMockFallback(prompt);
    }

    public String generateCompletion(String prompt) {
        return generateCompletion(prompt, 0.7, 1000);
    }

    private String generateMockFallback(String prompt) {
        String lower = prompt.toLowerCase();
        
        if (lower.contains("summary") || lower.contains("professional summary")) {
            return "Highly motivated and results-driven software engineer and fresh graduate with a strong foundation in modern web technologies including React, Java Spring Boot, and MySQL. Proven ability to build full-stack web applications, solve complex algorithmic challenges, and collaborate effectively in team-based environments. Eager to contribute to innovative software development projects and continuously adapt to new engineering tools.";
        }
        
        if (lower.contains("improve project description") || lower.contains("rewrite project")) {
            return "• Engineered and deployed a scalable full-stack web application featuring React, Tailwind CSS, and Java Spring Boot, reducing database query latencies by 25% through indexing.\n" +
                   "• Integrated JWT authentication and role-based access control, increasing user security and session management efficiency.\n" +
                   "• Formulated clean RESTful APIs and established continuous integration pipelines, streamlining feature deployment cycles.";
        }

        if (lower.contains("rewrite skills") || lower.contains("suggest missing skills")) {
            return "Advanced: Java, React.js, Spring Boot, MySQL, JavaScript, Git & GitHub\n" +
                   "Intermediate: Python, REST APIs, Tailwind CSS, Docker, Cloudinary, AWS S3\n" +
                   "Soft Skills: Problem Solving, Team Collaboration, Agile Methodologies, Clear Communication";
        }
        
        if (lower.contains("ats") || lower.contains("job description") || lower.contains("keywords")) {
            return "{\n" +
                   "  \"atsScore\": 85,\n" +
                   "  \"missingKeywords\": [\"Docker\", \"Kubernetes\", \"CI/CD Pipelines\", \"Unit Testing (JUnit)\"],\n" +
                   "  \"keywordMatchPercentage\": 78.5,\n" +
                   "  \"improvementSuggestions\": [\n" +
                   "    \"Integrate Docker and CI/CD concepts into your project descriptions to demonstrate deployment familiarity.\",\n" +
                   "    \"Explicitly list JUnit and Mockito under a Testing section to match the job description requirements.\",\n" +
                   "    \"Elaborate on database optimization details under your project description using quantifiable metrics.\"\n" +
                   "  ]\n" +
                   "}";
        }

        if (lower.contains("cover letter") || lower.contains("follow-up")) {
            return "[Your Name]\n" +
                   "[Email Address]\n\n" +
                   "Dear Hiring Manager,\n\n" +
                   "I am writing to express my enthusiastic interest in the Software Engineer position. As a recent graduate with hands-on experience developing full-stack web applications using React and Spring Boot, I am confident in my ability to add immediate value to your engineering team.\n\n" +
                   "During my academic tenure, I developed various projects, focusing on responsive frontend designs and highly performant backend REST APIs. I look forward to the opportunity to discuss my qualifications further in an interview.\n\n" +
                   "Sincerely,\n" +
                   "[Your Name]";
        }

        if (lower.contains("career") || lower.contains("advisor")) {
            return "{\n" +
                   "  \"jobRoles\": [\"Full-Stack Software Engineer\", \"Backend Developer\", \"Associate Software Engineer\"],\n" +
                   "  \"learningPaths\": [\n" +
                   "    \"Spring Cloud & Microservices architecture path\",\n" +
                   "    \"Modern Frontend Advanced React concepts (Redux Toolkit, Next.js)\"\n" +
                   "  ],\n" +
                   "  \"missingSkills\": [\"System Design\", \"Unit Testing\", \"AWS Cloud Basics\"],\n" +
                   "  \"certificationsToPursue\": [\"AWS Certified Cloud Practitioner\", \"Oracle Certified Associate: Java SE Programmer\"],\n" +
                   "  \"preparationTips\": [\n" +
                   "    \"Solve 2-3 LeetCode problems daily, focusing on Arrays, Strings, Trees, and Dynamic Programming.\",\n" +
                   "    \"Practice explaining your project architectural decisions out loud to prepare for Technical Interview rounds.\"\n" +
                   "  ]\n" +
                   "}";
        }

        if (lower.contains("interview") || lower.contains("prep") || lower.contains("hr")) {
            return "1. Tell me about yourself.\n" +
                   "Answer: Focus on your education, key projects (mentioning tech stacks like React/Spring Boot), and your interest in solving software challenges.\n\n" +
                   "2. Why do you want to work for our company?\n" +
                   "Answer: Highlight the company's tech innovation, learning opportunities, and align it with your technical aspirations.";
        }

        return "Generated response for: " + prompt + "\nThis is a placeholder response simulated from gemma-4-12B-it.";
    }
}
