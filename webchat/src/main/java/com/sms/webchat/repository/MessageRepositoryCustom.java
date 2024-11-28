package com.sms.webchat.repository;

import java.time.LocalDateTime;
import java.util.List;

import com.sms.webchat.dto.MessageDTO;

public interface MessageRepositoryCustom {
    int countUnreadMessages(Long roomId, Long userIdx);
    List<MessageDTO> findMessagesWithAttachments(Long roomId, LocalDateTime lastReadTime);
} 