package com.taskflow.api.service;

import com.taskflow.api.dto.AuthRequest;
import com.taskflow.api.dto.AuthResponse;
import com.taskflow.api.dto.RegisterRequest;
import com.taskflow.api.dto.UserDto;
import com.taskflow.api.model.User;

public interface UserService {
    User registerUser(RegisterRequest registerRequest);
    AuthResponse loginUser(AuthRequest authRequest);
    UserDto getCurrentUserDto(String username);
    User getCurrentUserEntity(String username);
}
