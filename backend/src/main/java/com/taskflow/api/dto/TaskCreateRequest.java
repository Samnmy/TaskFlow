package com.taskflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class TaskCreateRequest {
    @NotBlank
    private String title;

    @NotNull
    private Instant dueDate;

    public TaskCreateRequest() {}

    public TaskCreateRequest(String title, Instant dueDate) {
        this.title = title;
        this.dueDate = dueDate;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }
}
