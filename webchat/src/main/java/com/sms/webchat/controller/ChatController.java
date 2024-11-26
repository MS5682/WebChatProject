package com.sms.webchat.controller;

import com.sms.webchat.model.ChatMessage;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.text.SimpleDateFormat;
import java.util.Date;

@Controller
public class ChatController {
    
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    
    @MessageMapping("/chat.room/{roomId}/send")
    @SendTo("/topic/room/{roomId}")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage, 
                                 @DestinationVariable String roomId) {
        chatMessage.setTime(dateFormat.format(new Date()));
        chatMessage.setRoomId(roomId);
        System.out.println("메시지 수신 [방 " + roomId + "]: " + chatMessage);
        return chatMessage;
    }
} 