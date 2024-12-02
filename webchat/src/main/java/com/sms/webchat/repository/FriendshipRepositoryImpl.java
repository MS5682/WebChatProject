package com.sms.webchat.repository;

import java.util.List;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import com.sms.webchat.entity.Friendship;
import com.sms.webchat.entity.QFriendship;
import com.sms.webchat.enums.FriendshipStatus;  

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class FriendshipRepositoryImpl implements FriendshipRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<Friendship> findFriendships(Long userIdx, FriendshipStatus status) {
        QFriendship friendship = QFriendship.friendship;
        
        BooleanExpression userCondition = friendship.fromUser.idx.eq(userIdx)
            .or(friendship.toUser.idx.eq(userIdx));
            
        BooleanExpression statusCondition = status != null 
            ? friendship.status.eq(status)
            : null;
            
        return queryFactory
            .selectFrom(friendship)
            .where(userCondition, statusCondition)
            .fetch();
    }
} 