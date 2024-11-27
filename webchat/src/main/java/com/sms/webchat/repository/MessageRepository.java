package com.sms.webchat.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    void deleteAllByExpiresAtBefore(LocalDateTime expiresAt);
    List<Message> findByRoomIdAndCreatedAtAfterOrderByCreatedAtAsc(Long roomId, LocalDateTime lastReadTime);
} 