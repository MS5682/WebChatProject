package com.sms.webchat.dto.request;

import com.sms.webchat.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestDto {
    private String userId;
    private String name;
    private String email;
    private String password;

    public User toEntity(String encodedPassword) {
        return User.builder()
                .userId(this.userId)
                .name(this.name)
                .email(this.email)
                .password(encodedPassword)
                .build();
    }
} 