package com.taskflow.api.dto;

import com.taskflow.api.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class TaskUpdateRequest {
    @NotBlank
    private String title;

    @NotNull
    private Instant dueDate;

    @NotNull
    private TaskStatus status;

    public TaskUpdateRequest() {}

    public TaskUpdateRequest(String title, Instant dueDate, TaskStatus status) {
        this.title = title;
        this.dueDate = dueDate;
        this.status = status;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
}
