package com.ai.resumebuilder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.awt.Color;

@Service
public class PdfGenerationService {
    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] generateResumePdf(String resumeJson) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            JsonNode root = objectMapper.readTree(resumeJson);

            // Fonts
            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA, 18, Font.BOLD, Color.BLACK);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Font.BOLD, Color.DARK_GRAY);
            Font regularBoldFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.BOLD, Color.BLACK);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, Color.BLACK);
            Font italicFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.ITALIC, Color.GRAY);
            Font contactFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);

            // 1. Personal Information (Header)
            JsonNode personalInfo = root.path("personalInfo");
            String name = personalInfo.path("name").asText("Your Name");
            Paragraph namePara = new Paragraph(name, nameFont);
            namePara.setAlignment(Element.ALIGN_CENTER);
            namePara.setSpacingAfter(4);
            document.add(namePara);

            // Contact string: Email | Phone | Location | LinkedIn | GitHub
            StringBuilder contactBuilder = new StringBuilder();
            if (personalInfo.has("email") && !personalInfo.path("email").asText().isEmpty()) {
                contactBuilder.append(personalInfo.path("email").asText());
            }
            if (personalInfo.has("phone") && !personalInfo.path("phone").asText().isEmpty()) {
                if (contactBuilder.length() > 0) contactBuilder.append("  |  ");
                contactBuilder.append(personalInfo.path("phone").asText());
            }
            if (personalInfo.has("location") && !personalInfo.path("location").asText().isEmpty()) {
                if (contactBuilder.length() > 0) contactBuilder.append("  |  ");
                contactBuilder.append(personalInfo.path("location").asText());
            }
            Paragraph contactPara = new Paragraph(contactBuilder.toString(), contactFont);
            contactPara.setAlignment(Element.ALIGN_CENTER);
            document.add(contactPara);

            // Social Info: LinkedIn | GitHub
            StringBuilder socialBuilder = new StringBuilder();
            if (personalInfo.has("linkedin") && !personalInfo.path("linkedin").asText().isEmpty()) {
                socialBuilder.append("LinkedIn: ").append(personalInfo.path("linkedin").asText());
            }
            if (personalInfo.has("github") && !personalInfo.path("github").asText().isEmpty()) {
                if (socialBuilder.length() > 0) socialBuilder.append("  |  ");
                socialBuilder.append("GitHub: ").append(personalInfo.path("github").asText());
            }
            if (socialBuilder.length() > 0) {
                Paragraph socialPara = new Paragraph(socialBuilder.toString(), contactFont);
                socialPara.setAlignment(Element.ALIGN_CENTER);
                socialPara.setSpacingAfter(10);
                document.add(socialPara);
            }

            // Divider
            LineSeparator separator = new LineSeparator();
            separator.setLineColor(Color.GRAY);
            separator.setPercentage(100);
            document.add(new Chunk(separator));

            // 2. Summary Section
            String summary = personalInfo.path("summary").asText("");
            if (!summary.isEmpty()) {
                addSectionHeader(document, "PROFESSIONAL SUMMARY", sectionTitleFont);
                Paragraph summaryPara = new Paragraph(summary, regularFont);
                summaryPara.setSpacingAfter(12);
                document.add(summaryPara);
            }

            // 3. Education Section
            JsonNode educationList = root.path("education");
            if (educationList.isArray() && !educationList.isEmpty()) {
                addSectionHeader(document, "EDUCATION", sectionTitleFont);
                for (JsonNode edu : educationList) {
                    String inst = edu.path("institution").asText("");
                    String degree = edu.path("degree").asText("");
                    String gradYear = edu.path("graduationYear").asText("");
                    String cgpa = edu.path("cgpa").asText("");

                    Paragraph eduHeader = new Paragraph();
                    eduHeader.add(new Chunk(inst, regularBoldFont));
                    eduHeader.add(new Chunk(" — " + degree, regularFont));
                    
                    Paragraph eduRight = new Paragraph();
                    String rightStr = "Graduation: " + gradYear + (cgpa.isEmpty() ? "" : " (GPA: " + cgpa + ")");
                    eduRight.add(new Chunk(rightStr, italicFont));
                    eduRight.setAlignment(Element.ALIGN_LEFT);

                    document.add(eduHeader);
                    document.add(eduRight);
                    
                    // Little space between education items
                    Paragraph space = new Paragraph(" ");
                    space.setFont(FontFactory.getFont(FontFactory.HELVETICA, 4));
                    document.add(space);
                }
                Paragraph spacing = new Paragraph(" ");
                spacing.setFont(FontFactory.getFont(FontFactory.HELVETICA, 6));
                document.add(spacing);
            }

            // 4. Experience Section
            JsonNode experienceList = root.path("experience");
            if (experienceList.isArray() && !experienceList.isEmpty()) {
                addSectionHeader(document, "WORK EXPERIENCE", sectionTitleFont);
                for (JsonNode exp : experienceList) {
                    String company = exp.path("company").asText("");
                    String role = exp.path("role").asText("");
                    String duration = exp.path("duration").asText("");
                    String desc = exp.path("description").asText("");

                    Paragraph expHeader = new Paragraph();
                    expHeader.add(new Chunk(company + " — " + role, regularBoldFont));
                    expHeader.add(new Chunk(" (" + duration + ")", italicFont));
                    document.add(expHeader);

                    if (!desc.isEmpty()) {
                        Paragraph descPara = new Paragraph(desc, regularFont);
                        descPara.setSpacingAfter(6);
                        document.add(descPara);
                    }
                }
                Paragraph spacing = new Paragraph(" ");
                spacing.setFont(FontFactory.getFont(FontFactory.HELVETICA, 6));
                document.add(spacing);
            }

            // 5. Projects Section
            JsonNode projectsList = root.path("projects");
            if (projectsList.isArray() && !projectsList.isEmpty()) {
                addSectionHeader(document, "PROJECTS", sectionTitleFont);
                for (JsonNode proj : projectsList) {
                    String title = proj.path("title").asText("");
                    String tech = proj.path("technologies").asText("");
                    String desc = proj.path("description").asText("");

                    Paragraph projHeader = new Paragraph();
                    projHeader.add(new Chunk(title, regularBoldFont));
                    if (!tech.isEmpty()) {
                        projHeader.add(new Chunk(" (Technologies: " + tech + ")", italicFont));
                    }
                    document.add(projHeader);

                    if (!desc.isEmpty()) {
                        Paragraph descPara = new Paragraph(desc, regularFont);
                        descPara.setSpacingAfter(6);
                        document.add(descPara);
                    }
                }
                Paragraph spacing = new Paragraph(" ");
                spacing.setFont(FontFactory.getFont(FontFactory.HELVETICA, 6));
                document.add(spacing);
            }

            // 6. Skills Section
            JsonNode skillsNode = root.path("skills");
            if (skillsNode.isArray() && !skillsNode.isEmpty()) {
                addSectionHeader(document, "SKILLS", sectionTitleFont);
                StringBuilder skillsStr = new StringBuilder();
                for (int i = 0; i < skillsNode.size(); i++) {
                    skillsStr.append(skillsNode.get(i).asText());
                    if (i < skillsNode.size() - 1) {
                        skillsStr.append(", ");
                    }
                }
                Paragraph skillsPara = new Paragraph(skillsStr.toString(), regularFont);
                skillsPara.setSpacingAfter(12);
                document.add(skillsPara);
            }

            // 7. Certifications Section
            JsonNode certsNode = root.path("certifications");
            if (certsNode.isArray() && !certsNode.isEmpty()) {
                addSectionHeader(document, "CERTIFICATIONS", sectionTitleFont);
                for (JsonNode cert : certsNode) {
                    String cName = cert.path("name").asText("");
                    String issuer = cert.path("issuer").asText("");
                    Paragraph certPara = new Paragraph();
                    certPara.add(new Chunk("• " + cName, regularBoldFont));
                    if (!issuer.isEmpty()) {
                        certPara.add(new Chunk(" — issued by " + issuer, regularFont));
                    }
                    document.add(certPara);
                }
                Paragraph spacing = new Paragraph(" ");
                spacing.setFont(FontFactory.getFont(FontFactory.HELVETICA, 6));
                document.add(spacing);
            }

            // 8. Achievements & Languages
            JsonNode achNode = root.path("achievements");
            JsonNode langNode = root.path("languages");
            boolean hasAch = achNode.isArray() && !achNode.isEmpty();
            boolean hasLang = langNode.isArray() && !langNode.isEmpty();

            if (hasAch || hasLang) {
                addSectionHeader(document, "ACHIEVEMENTS & LANGUAGES", sectionTitleFont);
                if (hasAch) {
                    Paragraph achTitle = new Paragraph("Key Achievements:", regularBoldFont);
                    document.add(achTitle);
                    for (JsonNode ach : achNode) {
                        document.add(new Paragraph("• " + ach.asText(), regularFont));
                    }
                }
                if (hasLang) {
                    Paragraph langTitle = new Paragraph(hasAch ? "\nLanguages:" : "Languages:", regularBoldFont);
                    document.add(langTitle);
                    StringBuilder langStr = new StringBuilder();
                    for (int i = 0; i < langNode.size(); i++) {
                        langStr.append(langNode.get(i).asText());
                        if (i < langNode.size() - 1) {
                            langStr.append(", ");
                        }
                    }
                    document.add(new Paragraph(langStr.toString(), regularFont));
                }
            }

            document.close();
        } catch (Exception e) {
            logger.error("Error occurred while generating PDF: {}", e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private void addSectionHeader(Document document, String title, Font font) throws DocumentException {
        Paragraph heading = new Paragraph(title, font);
        heading.setSpacingBefore(8);
        heading.setSpacingAfter(4);
        document.add(heading);

        LineSeparator ls = new LineSeparator();
        ls.setLineColor(Color.LIGHT_GRAY);
        ls.setPercentage(100);
        document.add(new Chunk(ls));
    }
}
