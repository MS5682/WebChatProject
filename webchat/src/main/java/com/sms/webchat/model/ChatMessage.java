package com.sms.webchat.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;
    private String time;
    private List<String> users;

    public enum MessageType {
        CHAT, JOIN, LEAVE, ACTIVE_USERS
    }

    public ChatMessage() {
    }
} 