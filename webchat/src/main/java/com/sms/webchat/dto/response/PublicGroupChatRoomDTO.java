package com.sms.webchat.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicGroupChatRoomDTO {
    private Long id;
    private String name;
    private Integer maxParticipants;
    private Long participantCount;
    private LocalDateTime lastMessageTime;
    private Boolean hasPassword;
    private Boolean isActive;
} 