package com.taskflow.api.controller;

import com.taskflow.api.dto.ApiResponse;
import com.taskflow.api.dto.TaskCreateRequest;
import com.taskflow.api.dto.TaskDto;
import com.taskflow.api.dto.TaskUpdateRequest;
import com.taskflow.api.model.User;
import com.taskflow.api.service.TaskService;
import com.taskflow.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUserEntity(userDetails.getUsername());
        List<TaskDto> tasks = taskService.getTasksForUser(user);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUserEntity(userDetails.getUsername());
        TaskDto task = taskService.getTaskById(id, user);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskCreateRequest request,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUserEntity(userDetails.getUsername());
        TaskDto task = taskService.createTask(request.getTitle(), request.getDueDate(), user);
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable UUID id,
                                              @Valid @RequestBody TaskUpdateRequest request,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUserEntity(userDetails.getUsername());
        TaskDto task = taskService.updateTask(id, request.getTitle(), request.getDueDate(), request.getStatus(), user);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTask(@PathVariable UUID id,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUserEntity(userDetails.getUsername());
        taskService.deleteTask(id, user);
        return ResponseEntity.ok(new ApiResponse(true, "Task deleted successfully."));
    }
}
