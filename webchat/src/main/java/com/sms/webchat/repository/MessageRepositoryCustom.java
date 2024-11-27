package com.sms.webchat.repository;

public interface MessageRepositoryCustom {
    int countUnreadMessages(Long roomId, Long userIdx);
} 