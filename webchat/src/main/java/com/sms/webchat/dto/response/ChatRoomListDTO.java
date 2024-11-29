package com.sms.webchat.dto.response;

import java.time.LocalDateTime;

import com.sms.webchat.enums.RoomType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomListDTO {
    private Long roomId;
    private String roomName;
    private RoomType roomType;
    private int maxParticipants;
    private Boolean isActive;
    private long currentParticipants;
    private String latestMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
    private String participantNames;
} 