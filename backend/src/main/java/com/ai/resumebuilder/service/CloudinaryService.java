package com.ai.resumebuilder.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.trim().isEmpty()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            logger.info("Cloudinary configured successfully.");
        } else {
            logger.warn("Cloudinary configuration is missing. Uploads will use mock fallback.");
        }
    }

    public String uploadImage(MultipartFile file) throws IOException {
        if (cloudinary == null) {
            logger.warn("Cloudinary not configured. Returning default SVG avatar.");
            return "https://api.dicebear.com/7.x/adventurer/svg?seed=" + System.currentTimeMillis();
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "resume_builder_profiles"
            ));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            logger.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            return "https://api.dicebear.com/7.x/adventurer/svg?seed=" + System.currentTimeMillis();
        }
    }
}
