package com.sms.webchat.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PublicGroupChatRoomDTO {
    private Long id;
    private String name;
    private Integer maxParticipants;
    private Long currentParticipants;
    private LocalDateTime lastMessageTime;
    private boolean hasPassword;
} 