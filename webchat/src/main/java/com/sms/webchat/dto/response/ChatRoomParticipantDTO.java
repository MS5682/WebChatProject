package com.sms.webchat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatRoomParticipantDTO {
    private Long userIdx;
    private String name;
} 