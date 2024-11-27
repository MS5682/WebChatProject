package com.sms.webchat.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sms.webchat.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>, MessageRepositoryCustom {
    void deleteAllByExpiresAtBefore(LocalDateTime expiresAt);
    List<Message> findByRoomIdAndCreatedAtAfterOrderByCreatedAtAsc(Long roomId, LocalDateTime lastReadTime);
} 