package com.sms.webchat.mapper;

import org.springframework.stereotype.Component;
import com.sms.webchat.dto.FriendshipDTO;
import com.sms.webchat.entity.Friendship;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class FriendshipMapper {
    
    public FriendshipDTO toDto(Friendship friendship) {
        return FriendshipDTO.builder()
            .id(friendship.getId())
            .fromUserIdx(friendship.getFromUser().getIdx())
            .fromUserId(friendship.getFromUser().getUserId())
            .fromUserName(friendship.getFromUser().getName())
            .toUserIdx(friendship.getToUser().getIdx())
            .toUserId(friendship.getToUser().getUserId())
            .toUserName(friendship.getToUser().getName())
            .status(friendship.getStatus())
            .createdAt(friendship.getCreatedAt())
            .build();
    }
    
    public List<FriendshipDTO> toDtoList(List<Friendship> friendships) {
        return friendships.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
} 