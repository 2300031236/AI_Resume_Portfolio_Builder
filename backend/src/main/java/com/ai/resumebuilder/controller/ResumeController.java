package com.ai.resumebuilder.controller;

import com.ai.resumebuilder.dto.DashboardResponse;
import com.ai.resumebuilder.dto.ResumeRequest;
import com.ai.resumebuilder.model.Resume;
import com.ai.resumebuilder.security.UserDetailsImpl;
import com.ai.resumebuilder.service.HuggingFaceService;
import com.ai.resumebuilder.service.PdfGenerationService;
import com.ai.resumebuilder.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private PdfGenerationService pdfGenerationService;

    @Autowired
    private HuggingFaceService huggingFaceService;

    @PostMapping
    public ResponseEntity<?> createResume(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ResumeRequest request) {
        Resume resume = resumeService.saveResume(userDetails.getId(), request);
        return ResponseEntity.ok(resume);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ResumeRequest request) {
        Resume resume = resumeService.updateResume(id, userDetails.getId(), request);
        return ResponseEntity.ok(resume);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Resume resume = resumeService.getResumeById(id, userDetails.getId());
        return ResponseEntity.ok(resume);
    }

    @GetMapping
    public ResponseEntity<?> getMyResumes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Resume> resumes = resumeService.getResumesByUserId(userDetails.getId());
        return ResponseEntity.ok(resumes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        resumeService.deleteResume(id, userDetails.getId());
        return ResponseEntity.ok("Resume deleted successfully");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        DashboardResponse data = resumeService.getDashboardData(userDetails.getId());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Resume resume = resumeService.getResumeById(id, userDetails.getId());
        byte[] pdfBytes = pdfGenerationService.generateResumePdf(resume.getResumeData());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resume_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // ==========================================
    // AI Mappings using google/gemma-4-12B-it
    // ==========================================

    @PostMapping("/ai/summary")
    public ResponseEntity<?> generateSummary(@RequestBody Map<String, String> request) {
        String role = request.getOrDefault("role", "");
        String details = request.getOrDefault("details", "");
        
        String prompt = String.format(
                "You are an AI Career Assistant. Write a professional, high-impact resume summary for a candidate applying for the role of '%s'. " +
                "Incorporate the following achievements/details: '%s'. " +
                "Keep the summary concise (3-4 sentences, approximately 50-70 words) and tailored for a student/fresh graduate resume.",
                role, details
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("summary", result));
    }

    @PostMapping("/ai/improve-project")
    public ResponseEntity<?> improveProjectDescription(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "");
        String description = request.getOrDefault("description", "");

        String prompt = String.format(
                "You are an AI Career Assistant. Rewrite and improve the following project description for a student resume. " +
                "Project Title: '%s'. Raw Description: '%s'. " +
                "Write 3 high-quality, professional bullet points starting with strong action verbs (e.g. Engineered, Established, Designed). " +
                "Emphasize technical implementation, technologies, and mention positive metrics if possible.",
                title, description
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("description", result));
    }

    @PostMapping("/ai/rewrite-skills")
    public ResponseEntity<?> rewriteSkills(@RequestBody Map<String, String> request) {
        String skills = request.getOrDefault("skills", "");

        String prompt = String.format(
                "You are an expert resume reviewer. Take the following raw skills list and rewrite it professionally. " +
                "Raw Skills: '%s'. " +
                "Categorize them cleanly (e.g. Programming Languages, Frameworks, Developer Tools, Databases) " +
                "and format them beautifully for a resume.",
                skills
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("skills", result));
    }

    @PostMapping("/ai/suggest-skills")
    public ResponseEntity<?> suggestSkills(@RequestBody Map<String, String> request) {
        String userSkills = request.getOrDefault("userSkills", "");
        String jobDescription = request.getOrDefault("jobDescription", "");

        String prompt = String.format(
                "Compare the candidate's current skills: '%s' with the target Job Description: '%s'. " +
                "Identify and list 5 crucial skills or keywords missing from the candidate's current list that would optimize their resume's match percentage. " +
                "Format the response as a bulleted list.",
                userSkills, jobDescription
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("suggestions", result));
    }

    @PostMapping("/ai/grammar-correction")
    public ResponseEntity<?> correctGrammar(@RequestBody Map<String, String> request) {
        String text = request.getOrDefault("text", "");

        String prompt = String.format(
                "Correct any grammatical, spelling, or punctuation errors in the following text. " +
                "Ensure it flows professionally and retains a formal tone suitable for a resume: " +
                "'%s'",
                text
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("correctedText", result));
    }

    @PostMapping("/ai/ats-optimization")
    public ResponseEntity<?> atsOptimize(@RequestBody Map<String, String> request) {
        String resumeText = request.getOrDefault("resumeText", "");
        String targetRole = request.getOrDefault("targetRole", "");

        String prompt = String.format(
                "You are an ATS advisor. Analyze this resume content: '%s' " +
                "against the target role: '%s'. " +
                "Provide 4-5 bulleted action items explaining how to rephrase bullet points, format keywords, " +
                "and adjust section priorities to achieve a higher ATS score for this position.",
                resumeText, targetRole
        );

        String result = huggingFaceService.generateCompletion(prompt);
        return ResponseEntity.ok(Map.of("optimizationAdvice", result));
    }
}
