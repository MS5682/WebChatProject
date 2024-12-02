package com.sms.webchat.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomCreateRequestDTO {
    private String roomName;
    private String roomType;
    private Integer maxParticipants;
    private String password;
    private List<Long> participants;
} 