package com.sms.webchat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class MessageDTO {
    private String content;
    private String sender;
    private MessageType type;
    private String time;
    private String roomId;
    private String fileUrl;
    private String fileName;
    private String fileType;
    
    public enum MessageType {
        CHAT, FILE, SYSTEM
    }
} 