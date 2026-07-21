package com.taskflow.api.dto;

import com.taskflow.api.model.TaskPriority;
import com.taskflow.api.model.TaskStatus;
import java.time.Instant;
import java.util.UUID;

public class TaskDto {
    private UUID id;
    private String title;
    private Instant dueDate;
    private TaskStatus status;
    private TaskPriority priority;
    private long remainingDays;
    private Instant createdAt;
    private Instant updatedAt;

    public TaskDto() {}

    public TaskDto(UUID id, String title, Instant dueDate, TaskStatus status, TaskPriority priority, long remainingDays, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.status = status;
        this.priority = priority;
        this.remainingDays = remainingDays;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }

    public long getRemainingDays() { return remainingDays; }
    public void setRemainingDays(long remainingDays) { this.remainingDays = remainingDays; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
