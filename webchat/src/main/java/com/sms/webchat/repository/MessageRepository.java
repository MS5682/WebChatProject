package com.sms.webchat.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    void deleteAllByExpiresAtBefore(LocalDateTime expiresAt);
} 