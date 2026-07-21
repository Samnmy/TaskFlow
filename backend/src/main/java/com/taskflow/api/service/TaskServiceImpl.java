package com.taskflow.api.service;

import com.taskflow.api.dto.TaskDto;
import com.taskflow.api.exception.ResourceNotFoundException;
import com.taskflow.api.model.Task;
import com.taskflow.api.model.TaskPriority;
import com.taskflow.api.model.TaskStatus;
import com.taskflow.api.model.User;
import com.taskflow.api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public List<TaskDto> getTasksForUser(User user) {
        return taskRepository.findByUserIdSorted(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto getTaskById(UUID id, User user) {
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found or you are not the owner."));
        return convertToDto(task);
    }

    @Override
    @Transactional
    public TaskDto createTask(String title, Instant dueDate, User user) {
        Task task = new Task();
        task.setTitle(title);
        task.setDueDate(dueDate);
        task.setUser(user);
        
        // Auto-calculate priority and status
        task.setPriority(calculatePriority(dueDate));
        task.setStatus(calculateStatus(dueDate, TaskStatus.PENDING));

        Task savedTask = taskRepository.save(task);
        return convertToDto(savedTask);
    }

    @Override
    @Transactional
    public TaskDto updateTask(UUID id, String title, Instant dueDate, TaskStatus status, User user) {
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found or you are not the owner."));

        task.setTitle(title);
        task.setDueDate(dueDate);
        
        // Recalculate priority
        task.setPriority(calculatePriority(dueDate));
        
        // Recalculate status (e.g. if updated to completed, or if due date changes and it's overdue)
        task.setStatus(calculateStatus(dueDate, status));

        Task updatedTask = taskRepository.save(task);
        return convertToDto(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(UUID id, User user) {
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found or you are not the owner."));
        taskRepository.delete(task);
    }

    @Override
    @Transactional
    public void recalculateAllTaskPrioritiesAndStatuses() {
        List<Task> tasks = taskRepository.findAll();
        for (Task task : tasks) {
            task.setPriority(calculatePriority(task.getDueDate()));
            task.setStatus(calculateStatus(task.getDueDate(), task.getStatus()));
            taskRepository.save(task);
        }
    }

    private TaskPriority calculatePriority(Instant dueDate) {
        long days = ChronoUnit.DAYS.between(
                Instant.now().atZone(ZoneOffset.UTC).toLocalDate(),
                dueDate.atZone(ZoneOffset.UTC).toLocalDate()
        );

        if (days < 7) {
            return TaskPriority.CRITICAL;
        } else if (days <= 14) {
            return TaskPriority.HIGH;
        } else if (days <= 30) {
            return TaskPriority.MEDIUM;
        } else {
            return TaskPriority.LOW;
        }
    }

    private TaskStatus calculateStatus(Instant dueDate, TaskStatus currentStatus) {
        if (currentStatus == TaskStatus.COMPLETED) {
            return TaskStatus.COMPLETED;
        }
        
        // If due date has passed
        if (dueDate.isBefore(Instant.now())) {
            return TaskStatus.OVERDUE;
        }
        
        return TaskStatus.PENDING;
    }

    private TaskDto convertToDto(Task task) {
        long remainingDays = ChronoUnit.DAYS.between(
                Instant.now().atZone(ZoneOffset.UTC).toLocalDate(),
                task.getDueDate().atZone(ZoneOffset.UTC).toLocalDate()
        );

        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDueDate(),
                task.getStatus(),
                task.getPriority(),
                remainingDays,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
