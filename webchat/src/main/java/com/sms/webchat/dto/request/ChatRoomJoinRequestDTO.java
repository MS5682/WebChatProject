package com.sms.webchat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomJoinRequestDTO {
    private Long roomId;
    private Long userIdx;
    private String password;
} 