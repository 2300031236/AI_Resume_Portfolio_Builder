package com.ai.resumebuilder.repository;

import com.ai.resumebuilder.model.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
