package com.taskflow.api.repository;

import com.taskflow.api.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "ORDER BY CASE t.priority " +
           "  WHEN com.taskflow.api.model.TaskPriority.CRITICAL THEN 1 " +
           "  WHEN com.taskflow.api.model.TaskPriority.HIGH THEN 2 " +
           "  WHEN com.taskflow.api.model.TaskPriority.MEDIUM THEN 3 " +
           "  WHEN com.taskflow.api.model.TaskPriority.LOW THEN 4 END ASC, " +
           "t.dueDate ASC, t.createdAt DESC")
    List<Task> findByUserIdSorted(@Param("userId") UUID userId);

    Optional<Task> findByIdAndUserId(UUID id, UUID userId);
}
