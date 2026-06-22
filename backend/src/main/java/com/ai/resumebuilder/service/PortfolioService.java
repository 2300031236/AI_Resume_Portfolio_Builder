package com.ai.resumebuilder.service;

import com.ai.resumebuilder.dto.PortfolioRequest;
import com.ai.resumebuilder.exception.ResourceNotFoundException;
import com.ai.resumebuilder.model.*;
import com.ai.resumebuilder.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class PortfolioService {

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
    public Portfolio savePortfolio(Long userId, PortfolioRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<Portfolio> existing = portfolioRepository.findFirstByUserId(userId);
        Portfolio portfolio;
        if (existing.isPresent()) {
            portfolio = existing.get();
            portfolio.setTheme(request.getTheme());
            portfolio.setPortfolioData(request.getPortfolioData());
        } else {
            portfolio = Portfolio.builder()
                    .user(user)
                    .theme(request.getTheme())
                    .portfolioData(request.getPortfolioData())
                    .build();
        }

        return portfolioRepository.save(portfolio);
    }

    public Portfolio getPortfolioByUserId(Long userId) {
        return portfolioRepository.findFirstByUserId(userId)
                .orElseGet(() -> createDefaultPortfolio(userId));
    }

    @Transactional
    public Portfolio createDefaultPortfolio(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Education> edus = educationRepository.findByUserId(userId);
        List<Project> projs = projectRepository.findByUserId(userId);
        List<Experience> exps = experienceRepository.findByUserId(userId);
        List<Certification> certs = certificationRepository.findByUserId(userId);

        ObjectNode root = objectMapper.createObjectNode();
        
        // Hero Section
        ObjectNode hero = objectMapper.createObjectNode();
        hero.put("title", "Hello, I am " + user.getName());
        hero.put("subtitle", "Passionate Software Developer");
        hero.put("bio", "I design and build interactive web applications with robust backends and premium user interfaces.");
        root.set("hero", hero);

        // About section
        ObjectNode about = objectMapper.createObjectNode();
        about.put("description", "A fresh graduate dedicated to engineering high-quality solutions. Specialized in Java, Spring Boot, and React.js. Constantly learning and building side projects.");
        about.put("profileImage", user.getProfileImageUrl() != null ? user.getProfileImageUrl() : "");
        root.set("about", about);

        // Skills
        ArrayNode skills = objectMapper.createArrayNode();
        skills.add("Java").add("Spring Boot").add("React.js").add("JavaScript").add("MySQL").add("Tailwind CSS").add("Git");
        root.set("skills", skills);

        // Projects
        ArrayNode projectsArr = objectMapper.createArrayNode();
        for (Project p : projs) {
            ObjectNode pNode = objectMapper.createObjectNode();
            pNode.put("title", p.getTitle());
            pNode.put("description", p.getDescription());
            pNode.put("technologies", p.getTechnologies());
            projectsArr.add(pNode);
        }
        if (projs.isEmpty()) {
            ObjectNode demoProj = objectMapper.createObjectNode();
            demoProj.put("title", "AI Resume Builder");
            demoProj.put("description", "A full-stack project supporting user registrations, AI builders, and PDF downloads.");
            demoProj.put("technologies", "Spring Boot, React, MySQL");
            projectsArr.add(demoProj);
        }
        root.set("projects", projectsArr);

        // Experience
        ArrayNode expsArr = objectMapper.createArrayNode();
        for (Experience e : exps) {
            ObjectNode eNode = objectMapper.createObjectNode();
            eNode.put("company", e.getCompany());
            eNode.put("role", e.getRole());
            eNode.put("duration", e.getDuration());
            eNode.put("description", e.getDescription());
            expsArr.add(eNode);
        }
        root.set("experience", expsArr);

        // Certifications
        ArrayNode certsArr = objectMapper.createArrayNode();
        for (Certification c : certs) {
            ObjectNode cNode = objectMapper.createObjectNode();
            cNode.put("name", c.getName());
            cNode.put("issuer", c.getIssuer());
            certsArr.add(cNode);
        }
        root.set("certifications", certsArr);

        // Contact Info
        ObjectNode contact = objectMapper.createObjectNode();
        contact.put("email", user.getEmail());
        contact.put("phone", "");
        contact.put("github", "");
        contact.put("linkedin", "");
        root.set("contact", contact);

        Portfolio portfolio = Portfolio.builder()
                .user(user)
                .theme("modern")
                .portfolioData(root.toString())
                .build();

        return portfolioRepository.save(portfolio);
    }
}
