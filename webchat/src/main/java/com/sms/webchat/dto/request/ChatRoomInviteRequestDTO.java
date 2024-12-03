package com.sms.webchat.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ChatRoomInviteRequestDTO {
    private Long roomId;
    private List<Long> participantList;
} 