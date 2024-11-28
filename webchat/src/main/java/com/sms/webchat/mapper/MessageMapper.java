package com.sms.webchat.mapper;

import org.springframework.stereotype.Component;

import com.sms.webchat.dto.MessageDTO;
import com.sms.webchat.entity.ChatRoom;
import com.sms.webchat.entity.Message;
import com.sms.webchat.entity.MessageAttachment;
import com.sms.webchat.entity.User;

@Component
public class MessageMapper {
    
    public Message toEntity(MessageDTO dto, User sender, ChatRoom room) {
        return Message.builder()
            .content(dto.getContent())
            .sender(sender)
            .room(room)
            .build();
    }
    
    public MessageDTO toDto(Message message) {
        return MessageDTO.builder()
            .content(message.getContent())
            .sender(message.getSender().getName())
            .time(message.getCreatedAt().toString())
            .roomId(message.getRoom().getId().toString())
            .type(MessageDTO.MessageType.CHAT)
            .build();
    }
    
    public MessageDTO toDto(MessageAttachment attachment) {
        return MessageDTO.builder()
            .content(attachment.getMessage().getContent())
            .sender(attachment.getMessage().getSender().getName())
            .time(attachment.getMessage().getCreatedAt().toString())
            .roomId(attachment.getMessage().getRoom().getId().toString())
            .type(MessageDTO.MessageType.FILE)
            .fileUrl(attachment.getUrl())
            .fileName(attachment.getName())
            .fileType(attachment.getType())
            .build();
    }
    
    public MessageAttachment toMessageAttachment(MessageDTO dto, Message message) {
        return MessageAttachment.builder()
            .message(message)
            .url(dto.getFileUrl())
            .name(dto.getFileName())
            .type(dto.getFileType())
            .build();
    }
} 