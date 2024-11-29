package com.sms.webchat.mapper;

import org.springframework.stereotype.Component;
import com.sms.webchat.dto.UserDTO;
import com.sms.webchat.entity.User;
import com.sms.webchat.dto.request.SignupRequestDto;
import java.util.List;
import java.util.stream.Collectors;

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

    public UserDTO toDto(User user) {
        return UserDTO.builder()
                .idx(user.getIdx())
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    public List<UserDTO> toDtoList(List<User> users) {
        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
} 