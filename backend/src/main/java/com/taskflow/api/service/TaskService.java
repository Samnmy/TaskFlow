package com.taskflow.api.service;

import com.taskflow.api.dto.TaskDto;
import com.taskflow.api.model.TaskStatus;
import com.taskflow.api.model.User;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TaskService {
    List<TaskDto> getTasksForUser(User user);
    TaskDto getTaskById(UUID id, User user);
    TaskDto createTask(String title, Instant dueDate, User user);
    TaskDto updateTask(UUID id, String title, Instant dueDate, TaskStatus status, User user);
    void deleteTask(UUID id, User user);
    void recalculateAllTaskPrioritiesAndStatuses();
}
