package com.sms.webchat.service;

import com.sms.webchat.entity.Message;
import com.sms.webchat.repository.MessageRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    
    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
} 