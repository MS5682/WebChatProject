package com.sms.webchat.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import com.sms.webchat.entity.QMessage;
import com.sms.webchat.entity.QRoomParticipant;
import java.time.LocalDateTime;

@RequiredArgsConstructor
public class MessageRepositoryCustomImpl implements MessageRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    
    @Override
    public int countUnreadMessages(Long roomId, Long userIdx) {
        QMessage message = QMessage.message;
        QRoomParticipant participant = QRoomParticipant.roomParticipant;
        
        LocalDateTime lastReadTime = queryFactory
            .select(participant.lastReadTime)
            .from(participant)
            .where(participant.room.id.eq(roomId)
                .and(participant.user.idx.eq(userIdx)))
            .fetchOne();
            
        return queryFactory
            .select(message.count())
            .from(message)
            .where(message.room.id.eq(roomId)
                .and(message.sender.idx.ne(userIdx))
                .and(message.createdAt.gt(
                    lastReadTime != null ? lastReadTime : LocalDateTime.MIN
                )))
            .fetchOne()
            .intValue();
    }
} 