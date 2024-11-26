package com.sms.webchat.repository;

import java.util.List;

import com.querydsl.core.types.ExpressionUtils;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.sms.webchat.dto.response.ChatRoomListDTO;
import com.sms.webchat.dto.response.PublicGroupChatRoomDTO;
import com.sms.webchat.entity.QChatRoom;
import com.sms.webchat.entity.QMessage;
import com.sms.webchat.entity.QRoomParticipant;
import com.sms.webchat.enums.RoomType;
import com.querydsl.core.types.dsl.Expressions;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ChatRoomRepositoryImpl implements ChatRoomRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<ChatRoomListDTO> findChatRoomsByUserIdx(Long userIdx) {
        QChatRoom chatRoom = QChatRoom.chatRoom;
        QRoomParticipant roomParticipant = QRoomParticipant.roomParticipant;
        QMessage message = QMessage.message;
        QRoomParticipant lastRead = new QRoomParticipant("lastRead");
        
        return queryFactory
            .select(Projections.constructor(ChatRoomListDTO.class,
                chatRoom.id,
                chatRoom.name,
                chatRoom.roomType,
                chatRoom.maxParticipants,
                JPAExpressions
                    .select(roomParticipant.count())
                    .from(roomParticipant)
                    .where(roomParticipant.room.eq(chatRoom)),
                JPAExpressions
                    .select(message.content)
                    .from(message)
                    .where(message.room.eq(chatRoom)
                        .and(message.createdAt.eq(
                            JPAExpressions
                                .select(message.createdAt.max())
                                .from(message)
                                .where(message.room.eq(chatRoom))
                        ))),
                ExpressionUtils.as(
                JPAExpressions
                    .select(message.createdAt)
                    .from(message)
                    .where(message.room.eq(chatRoom)
                        .and(message.createdAt.eq(
                            JPAExpressions
                                .select(message.createdAt.max())
                                .from(message)
                                .where(message.room.eq(chatRoom))
                        ))),"lastMessageTime"),
                JPAExpressions
                    .select(message.count())
                    .from(message)
                    .where(message.room.eq(chatRoom)
                        .and(message.createdAt.gt(
                            JPAExpressions
                                .select(lastRead.lastReadTime.max())
                                .from(lastRead)
                                .where(lastRead.room.eq(chatRoom)
                                    .and(lastRead.user.idx.eq(userIdx)))
                        )))
            ))
            .from(chatRoom)
            .join(roomParticipant).on(roomParticipant.room.eq(chatRoom))
            .where(
                roomParticipant.user.idx.eq(userIdx)
                    .and(chatRoom.isActive.eq(true))
            )
            .orderBy(Expressions.stringPath("lastMessageTime").desc())
            .fetch();
    }

    @Override
    public List<PublicGroupChatRoomDTO> findPublicGroupChatRooms() {
        QChatRoom chatRoom = QChatRoom.chatRoom;
        QRoomParticipant roomParticipant = QRoomParticipant.roomParticipant;
        QMessage message = QMessage.message;

        return queryFactory
            .select(Projections.constructor(PublicGroupChatRoomDTO.class,
                chatRoom.id,
                chatRoom.name,
                chatRoom.maxParticipants,
                JPAExpressions
                    .select(roomParticipant.count())
                    .from(roomParticipant)
                    .where(roomParticipant.room.eq(chatRoom)),
                ExpressionUtils.as(
                JPAExpressions
                    .select(message.createdAt)
                    .from(message)
                    .where(message.room.eq(chatRoom)
                        .and(message.createdAt.eq(
                            JPAExpressions
                                .select(message.createdAt.max())
                                .from(message)
                                .where(message.room.eq(chatRoom))
                        ))),"lastMessageTime"),
                chatRoom.password.isNotNull()
            ))
            .from(chatRoom)
            .where(
                chatRoom.roomType.eq(RoomType.PUBLIC_GROUP)
                    .and(chatRoom.isActive.eq(true))
            )
            .orderBy(Expressions.stringPath("lastMessageTime").desc())
            .fetch();
    }
}