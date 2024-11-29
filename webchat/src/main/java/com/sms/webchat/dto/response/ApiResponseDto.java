package com.sms.webchat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponseDto {
    private boolean success;
    private String message;
    private String userId;
    private Long friendshipId;

    public ApiResponseDto(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public ApiResponseDto(boolean success, String message, Long friendshipId) {
        this.success = success;
        this.message = message;
        this.friendshipId = friendshipId;
    }
} 