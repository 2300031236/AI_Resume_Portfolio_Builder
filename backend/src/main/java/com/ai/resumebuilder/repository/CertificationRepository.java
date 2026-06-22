package com.ai.resumebuilder.repository;

import com.ai.resumebuilder.model.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
