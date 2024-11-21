package com.sms.webchat.dto.request;

import lombok.*;

@Getter
@Setter
public class ChangePasswordRequest {
    private String email;
    private String password;
} 