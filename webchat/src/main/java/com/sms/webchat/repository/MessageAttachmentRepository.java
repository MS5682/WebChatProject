package com.sms.webchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.MessageAttachment;
import com.sms.webchat.entity.Message;
import java.util.Optional;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {
    Optional<MessageAttachment> findByMessage(Message message);
    void deleteByMessage(Message message);
} 