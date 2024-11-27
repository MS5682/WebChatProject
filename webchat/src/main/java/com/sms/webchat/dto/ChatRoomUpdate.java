package com.sms.webchat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomUpdate {
    private String type;            // 업데이트 타입 (예: "NEW_MESSAGE")
    private Long roomId;            // 채팅방 ID
    private int totalUnread;        // 안 읽은 메시지 수
    private MessageDTO lastMessage; // 마지막 메시지
} 