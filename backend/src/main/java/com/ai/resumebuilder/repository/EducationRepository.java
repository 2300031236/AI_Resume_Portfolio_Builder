package com.ai.resumebuilder.repository;

import com.ai.resumebuilder.model.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
