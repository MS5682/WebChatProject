package com.sms.webchat.dto;

import com.sms.webchat.entity.Message;
import com.sms.webchat.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.sms.webchat.entity.ChatRoom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private String content;
    private String sender;
    private MessageType type;
    private String time;
    private String roomId;
    
    // DTO -> Entity 변환
    public Message toEntity(User sender, ChatRoom room) {
        return Message.builder()
            .content(this.content)
            .sender(sender)
            .room(room)
            .createdAt(LocalDateTime.ofInstant(
                Instant.parse(this.time), 
                ZoneId.systemDefault()))
            .build();
    }
    
    // Entity -> DTO 변환
    public static MessageDTO fromEntity(Message message) {
        return MessageDTO.builder()
            .content(message.getContent())
            .sender(message.getSender().getName())
            .time(message.getCreatedAt().toString())
            .roomId(message.getRoom().getId().toString())
            .type(MessageType.CHAT)
            .build();
    }
    
    public enum MessageType {
        CHAT, JOIN, LEAVE, ACTIVE_USERS
    }
} 