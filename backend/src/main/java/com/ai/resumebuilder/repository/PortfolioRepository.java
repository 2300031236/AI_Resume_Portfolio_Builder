package com.ai.resumebuilder.repository;

import com.ai.resumebuilder.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUserId(Long userId);
    long countByUserId(Long userId);
    Optional<Portfolio> findFirstByUserId(Long userId);
}
