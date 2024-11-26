package com.sms.webchat.controller;

import com.sms.webchat.model.UserStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;

@Controller
public class UserStatusController {
    
    private Set<String> onlineUsers = new HashSet<>();
    
    @MessageMapping("/user.status")
    @SendTo("/topic/status")
    public UserStatus handleUserStatus(@Payload UserStatus userStatus) {
        if ("ONLINE".equals(userStatus.getStatus())) {
            onlineUsers.add(userStatus.getUserIdx());
        } else if ("OFFLINE".equals(userStatus.getStatus())) {
            onlineUsers.remove(userStatus.getUserIdx());
        }
        
        userStatus.setOnlineUsers(new ArrayList<>(onlineUsers));
        return userStatus;
    }
} 