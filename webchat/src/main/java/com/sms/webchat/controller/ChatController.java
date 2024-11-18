package com.sms.webchat.controller;

import com.sms.webchat.model.ChatMessage;
import com.sms.webchat.model.ChatMessage.MessageType;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;

@Controller
public class ChatController {
    
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private Set<String> activeUsers = new HashSet<>();
    
    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.register")
    @SendTo("/topic/public")
    public ChatMessage register(@Payload ChatMessage chatMessage) {
        activeUsers.add(chatMessage.getSender());
        chatMessage.setContent(chatMessage.getSender() + "님이 입장하셨습니다.");
        chatMessage.setType(MessageType.JOIN);
        chatMessage.setTime(dateFormat.format(new Date()));
        chatMessage.setUsers(new ArrayList<>(activeUsers));
        return chatMessage;
    }

    @MessageMapping("/chat.leave")
    @SendTo("/topic/public")
    public ChatMessage leave(@Payload ChatMessage chatMessage) {
        activeUsers.remove(chatMessage.getSender());
        chatMessage.setContent(chatMessage.getSender() + "님이 퇴장하셨습니다.");
        chatMessage.setType(MessageType.LEAVE);
        chatMessage.setTime(dateFormat.format(new Date()));
        chatMessage.setUsers(new ArrayList<>(activeUsers));
        return chatMessage;
    }

    @MessageMapping("/chat.activeUsers")
    @SendTo("/topic/public")
    public ChatMessage getActiveUsers() {
        return ChatMessage.builder()
                .type(MessageType.ACTIVE_USERS)
                .users(new ArrayList<>(activeUsers))
                .build();
    }

    public void addUser(String username) {
        activeUsers.add(username);
        // 필요하다면 여기서 새로운 사용자 접속을 브로드캐스트
    }

    public void removeUser(String username) {
        activeUsers.remove(username);
        // 필요하다면 여기서 사용자 퇴장을 브로드캐스트
    }
} 