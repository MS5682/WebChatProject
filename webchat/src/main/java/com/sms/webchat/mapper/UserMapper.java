package com.sms.webchat.mapper;

import org.springframework.stereotype.Component;

import com.sms.webchat.dto.request.SignupRequestDto;
import com.sms.webchat.entity.User;

@Component
public class UserMapper {
    
    public User toEntity(SignupRequestDto dto, String encodedPassword) {
        return User.builder()
                .userId(dto.getUserId())
                .name(dto.getName())
                .email(dto.getEmail())
                .password(encodedPassword)
                .build();
    }
} 