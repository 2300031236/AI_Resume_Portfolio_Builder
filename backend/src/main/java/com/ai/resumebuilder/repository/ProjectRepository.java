package com.ai.resumebuilder.repository;

import com.ai.resumebuilder.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
