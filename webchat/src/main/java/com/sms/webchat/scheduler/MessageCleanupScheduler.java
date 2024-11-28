package com.sms.webchat.scheduler;

import java.time.LocalDateTime;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sms.webchat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MessageCleanupScheduler {
    private final MessageRepository messageRepository;
    
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredMessages() {
        messageRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
    }
} 