package com.sms.webchat.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.sms.webchat.entity.MessageAttachment;
import com.sms.webchat.repository.MessageAttachmentRepository;

@Service
@RequiredArgsConstructor
public class MessageAttachmentService {
    private final MessageAttachmentRepository messageAttachmentRepository;
    
    public MessageAttachment saveMessageAttachment(MessageAttachment attachment) {
        return messageAttachmentRepository.save(attachment);
    }
} 