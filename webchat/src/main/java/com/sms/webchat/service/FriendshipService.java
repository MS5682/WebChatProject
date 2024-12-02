package com.sms.webchat.service;

import com.sms.webchat.entity.Friendship;
import com.sms.webchat.enums.FriendshipStatus;
import com.sms.webchat.entity.User;
import com.sms.webchat.repository.FriendshipRepository;
import com.sms.webchat.repository.UserRepository;
import com.sms.webchat.dto.FriendshipDTO;
import com.sms.webchat.mapper.FriendshipMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final FriendshipMapper friendshipMapper;

    public Long createFriendshipRequest(Long fromUserIdx, Long toUserIdx) {
        User fromUser = userRepository.findById(fromUserIdx)
            .orElseThrow(() -> new RuntimeException("요청을 보내는 사용자를 찾을 수 없습니다."));
        User toUser = userRepository.findById(toUserIdx)
            .orElseThrow(() -> new RuntimeException("요청을 받는 사용자를 찾을 수 없습니다."));

        if (friendshipRepository.existsByFromUserAndToUser(fromUser, toUser)) {
            throw new RuntimeException("이미 친구 요청이 존재합니다.");
        }

        Friendship friendship = Friendship.builder()
            .fromUser(fromUser)
            .toUser(toUser)
            .status(FriendshipStatus.PENDING)
            .build();

        friendship = friendshipRepository.save(friendship);
        return friendship.getId();
    }

    public void updateFriendshipStatus(Long friendshipId, FriendshipStatus status) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> new RuntimeException("친구 요청을 찾을 수 없습니다."));
        
        friendship.setStatus(status);
        friendshipRepository.save(friendship);
    }

    public List<FriendshipDTO> getFriendshipsByUserIdx(Long userIdx, FriendshipStatus status) {
        List<Friendship> friendships = friendshipRepository.findFriendships(userIdx, status);
        return friendshipMapper.toDtoList(friendships);
    }

    public void deleteFriendship(Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> new RuntimeException("친구 요청을 찾을 수 없습니다."));
        friendshipRepository.delete(friendship);
    }

    public void blockFriendship(Long friendshipId, FriendshipStatus status, Long userIdx) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> new RuntimeException("친구 요청을 찾을 수 없습니다."));
        
        if (friendship.getToUser().getIdx().equals(userIdx)) {
            User tempUser = friendship.getFromUser();
            friendship.setFromUser(friendship.getToUser());
            friendship.setToUser(tempUser);
        }
        
        friendship.setStatus(status);
        friendshipRepository.save(friendship);
    }
} 