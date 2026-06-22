package com.ai.resumebuilder.repository;

import com.ai.resumebuilder.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserId(Long userId);
    long countByUserId(Long userId);
    List<Resume> findTop5ByUserIdOrderByUpdatedAtDesc(Long userId);
}
