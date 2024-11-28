package com.sms.webchat.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import com.sms.webchat.dto.MessageDTO;
import com.sms.webchat.entity.QMessage;
import com.sms.webchat.entity.QMessageAttachment;
import com.sms.webchat.entity.QRoomParticipant;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
public class MessageRepositoryImpl implements MessageRepositoryCustom {
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

    @Override
    public List<MessageDTO> findMessagesWithAttachments(Long roomId, LocalDateTime lastReadTime) {
        QMessage message = QMessage.message;
        QMessageAttachment attachment = QMessageAttachment.messageAttachment;
        
        System.out.println("Executing query with roomId: " + roomId + ", lastReadTime: " + lastReadTime);
        
        try {
            List<MessageDTO> results = queryFactory
                .select(Projections.constructor(MessageDTO.class,
                    message.content,
                    message.sender.name,
                    Expressions.constant(MessageDTO.MessageType.CHAT),
                    message.createdAt.stringValue(),
                    message.room.id.stringValue(),
                    attachment.url,
                    attachment.name,
                    attachment.type))
                .from(message)
                .leftJoin(attachment).on(attachment.message.eq(message))
                .join(message.sender)
                .join(message.room)
                .where(message.room.id.eq(roomId)
                    .and(message.createdAt.after(lastReadTime)))
                .orderBy(message.createdAt.asc())
                .fetch();
            
            results.forEach(dto -> {
                if (dto.getFileUrl() != null) {
                    dto.setType(MessageDTO.MessageType.FILE);
                }
            });
            
            System.out.println("Query results: " + results);
            return results;
        } catch (Exception e) {
            System.err.println("Error executing query: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
} 