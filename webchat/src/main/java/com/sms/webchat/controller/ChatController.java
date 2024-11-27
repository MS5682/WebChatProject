package com.sms.webchat.controller;

import com.sms.webchat.dto.MessageDTO;
import com.sms.webchat.entity.ChatRoom;
import com.sms.webchat.entity.Message;
import com.sms.webchat.entity.User;
import com.sms.webchat.service.ChatRoomService;
import com.sms.webchat.service.MessageService;
import com.sms.webchat.service.UserService;


import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final MessageService messageService;
    
    public ChatController(UserService userService, ChatRoomService chatRoomService, MessageService messageService) {
        this.userService = userService;
        this.chatRoomService = chatRoomService;
        this.messageService = messageService;
    }
    
    @MessageMapping("/chat.room/{roomId}/send")
    public void sendMessage(@Payload MessageDTO messageDTO, 
                          @DestinationVariable String roomId) {
        User sender = userService.findByName(messageDTO.getSender());
        ChatRoom room = chatRoomService.findById(Long.parseLong(messageDTO.getRoomId()));
        
        messageService.saveMessage(messageDTO.toEntity(sender, room));
    }
} 