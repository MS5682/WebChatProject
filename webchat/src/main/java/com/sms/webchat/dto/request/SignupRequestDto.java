package com.sms.webchat.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestDto {
    private String userId;
    private String name;
    private String email;
    private String password;
} 