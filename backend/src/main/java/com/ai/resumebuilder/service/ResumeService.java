package com.ai.resumebuilder.service;

import com.ai.resumebuilder.dto.DashboardResponse;
import com.ai.resumebuilder.dto.ResumeRequest;
import com.ai.resumebuilder.exception.ResourceNotFoundException;
import com.ai.resumebuilder.model.*;
import com.ai.resumebuilder.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ResumeService {
    private static final Logger logger = LoggerFactory.getLogger(ResumeService.class);

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Resume saveResume(Long userId, ResumeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Resume resume = Resume.builder()
                .user(user)
                .template(request.getTemplate())
                .atsScore(request.getAtsScore() != null ? request.getAtsScore() : 0)
                .resumeData(request.getResumeData())
                .build();

        Resume savedResume = resumeRepository.save(resume);

        // Sync details into relational tables for Career Advisor & Portfolio usage
        try {
            syncResumeDataToTables(user, request.getResumeData());
        } catch (Exception e) {
            logger.error("Failed to sync resume details to profile tables: {}", e.getMessage());
        }

        return savedResume;
    }

    @Transactional
    public Resume updateResume(Long resumeId, Long userId, ResumeRequest request) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        if (!resume.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Resume does not belong to this user");
        }

        resume.setTemplate(request.getTemplate());
        resume.setAtsScore(request.getAtsScore() != null ? request.getAtsScore() : resume.getAtsScore());
        resume.setResumeData(request.getResumeData());
        resume.setUpdatedAt(LocalDateTime.now());

        Resume updatedResume = resumeRepository.save(resume);

        try {
            syncResumeDataToTables(resume.getUser(), request.getResumeData());
        } catch (Exception e) {
            logger.error("Failed to sync resume details to profile tables: {}", e.getMessage());
        }

        return updatedResume;
    }

    public Resume getResumeById(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        if (!resume.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Resume access denied");
        }

        return resume;
    }

    public List<Resume> getResumesByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = getResumeById(resumeId, userId);
        resumeRepository.delete(resume);
    }

    public DashboardResponse getDashboardData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        long resumeCount = resumeRepository.countByUserId(userId);
        long portfolioCount = portfolioRepository.countByUserId(userId);

        List<Resume> resumes = resumeRepository.findByUserId(userId);
        int avgAtsScore = 0;
        if (!resumes.isEmpty()) {
            int total = 0;
            for (Resume r : resumes) {
                total += r.getAtsScore() != null ? r.getAtsScore() : 0;
            }
            avgAtsScore = total / resumes.size();
        }

        List<String> recentActivity = new ArrayList<>();
        List<Resume> recentResumes = resumeRepository.findTop5ByUserIdOrderByUpdatedAtDesc(userId);
        for (Resume r : recentResumes) {
            recentActivity.add("Modified resume using " + r.getTemplate() + " template on " + r.getUpdatedAt().toLocalDate());
        }
        if (recentActivity.isEmpty()) {
            recentActivity.add("Created account on " + user.getCreatedAt().toLocalDate());
        }

        List<String> careerRecommendations = new ArrayList<>();
        careerRecommendations.add("Full-Stack Web Developer");
        careerRecommendations.add("Software Engineer Intern");
        careerRecommendations.add("React Developer");

        return DashboardResponse.builder()
                .welcomeMessage("Welcome back, " + user.getName() + "!")
                .resumeCount(resumeCount)
                .portfolioCount(portfolioCount)
                .avgAtsScore(avgAtsScore)
                .recentActivity(recentActivity)
                .careerRecommendations(careerRecommendations)
                .build();
    }

    @Transactional
    protected void syncResumeDataToTables(User user, String resumeJson) throws Exception {
        JsonNode root = objectMapper.readTree(resumeJson);

        // Delete existing items to re-insert cleanly
        educationRepository.deleteByUserId(user.getId());
        projectRepository.deleteByUserId(user.getId());
        experienceRepository.deleteByUserId(user.getId());
        certificationRepository.deleteByUserId(user.getId());

        // 1. Sync Education
        JsonNode educationNode = root.path("education");
        if (educationNode.isArray()) {
            for (JsonNode node : educationNode) {
                Education edu = Education.builder()
                        .user(user)
                        .degree(node.path("degree").asText("Degree"))
                        .institution(node.path("institution").asText("Institution"))
                        .cgpa(node.path("cgpa").asText(""))
                        .graduationYear(node.path("graduationYear").asInt(2025))
                        .build();
                educationRepository.save(edu);
            }
        }

        // 2. Sync Projects
        JsonNode projectsNode = root.path("projects");
        if (projectsNode.isArray()) {
            for (JsonNode node : projectsNode) {
                Project proj = Project.builder()
                        .user(user)
                        .title(node.path("title").asText("Project Title"))
                        .description(node.path("description").asText(""))
                        .technologies(node.path("technologies").asText(""))
                        .build();
                projectRepository.save(proj);
            }
        }

        // 3. Sync Experience
        JsonNode experienceNode = root.path("experience");
        if (experienceNode.isArray()) {
            for (JsonNode node : experienceNode) {
                Experience exp = Experience.builder()
                        .user(user)
                        .company(node.path("company").asText("Company"))
                        .role(node.path("role").asText("Role"))
                        .duration(node.path("duration").asText("Duration"))
                        .description(node.path("description").asText(""))
                        .build();
                experienceRepository.save(exp);
            }
        }

        // 4. Sync Certifications
        JsonNode certsNode = root.path("certifications");
        if (certsNode.isArray()) {
            for (JsonNode node : certsNode) {
                Certification cert = Certification.builder()
                        .user(user)
                        .name(node.path("name").asText("Certification Name"))
                        .issuer(node.path("issuer").asText("Issuer"))
                        .build();
                certificationRepository.save(cert);
            }
        }
    }
}
