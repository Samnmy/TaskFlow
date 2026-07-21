package com.taskflow.api.controller;

import com.taskflow.api.dto.AuthRequest;
import com.taskflow.api.dto.AuthResponse;
import com.taskflow.api.dto.RegisterRequest;
import com.taskflow.api.model.User;
import com.taskflow.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = userService.registerUser(registerRequest);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse response = userService.loginUser(authRequest);
        return ResponseEntity.ok(response);
    }
}
