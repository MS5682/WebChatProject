package com.sms.webchat.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.sms.webchat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MessageCleanupScheduler {
    private final MessageRepository messageRepository;
    
    @Scheduled(cron = "0 0 2 * * *")  // 매일 새벽 2시에 실행
    public void cleanupExpiredMessages() {
        messageRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
    }
} 