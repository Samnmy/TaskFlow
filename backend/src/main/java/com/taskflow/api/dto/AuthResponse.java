package com.taskflow.api.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private UUID id;
    private String username;
    private String email;

    public AuthResponse() {}

    public AuthResponse(String token, UUID id, String username, String email) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
