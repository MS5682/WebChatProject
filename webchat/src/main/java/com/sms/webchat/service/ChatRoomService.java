package com.sms.webchat.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sms.webchat.dto.response.ChatRoomListDTO;
import com.sms.webchat.dto.response.PublicGroupChatRoomDTO;
import com.sms.webchat.entity.ChatRoom;
import com.sms.webchat.dto.response.ChatRoomParticipantDTO;
import com.sms.webchat.repository.ChatRoomRepository;
import com.sms.webchat.repository.RoomParticipantRepository;
import com.sms.webchat.entity.RoomParticipant;
import com.sms.webchat.dto.MessageDTO;
import com.sms.webchat.entity.Message;
import com.sms.webchat.repository.MessageRepository;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final RoomParticipantRepository roomParticipantRepository;
    private final MessageRepository messageRepository;
    
    public List<ChatRoomListDTO> getChatRoomsByUserIdx(Long userIdx) {
        return chatRoomRepository.findChatRoomsByUserIdx(userIdx);
    }

    public List<PublicGroupChatRoomDTO> getPublicGroupChatRooms() {
        return chatRoomRepository.findPublicGroupChatRooms();
    }

    public List<ChatRoomParticipantDTO> getChatRoomParticipants(Long roomId) {
        return chatRoomRepository.findParticipantsByRoomId(roomId);
    }

    public ChatRoom findById(Long roomId) {
        return chatRoomRepository.findById(roomId).orElse(null);
    }

    @Transactional
    public void updateLastReadTime(Long roomId, Long userIdx) {
        RoomParticipant participant = roomParticipantRepository.findByRoomIdAndUserIdx(roomId, userIdx)
            .orElseThrow(() -> new RuntimeException("참여자를 찾을 수 없습니다."));
        
        participant.setLastReadTime(LocalDateTime.now());
        roomParticipantRepository.save(participant);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getUnreadMessages(Long roomId, Long userIdx) {
        // 참여자의 마지막 읽은 시간 조회
        RoomParticipant participant = roomParticipantRepository.findByRoomIdAndUserIdx(roomId, userIdx)
            .orElseThrow(() -> new RuntimeException("참여자를 찾을 수 없습니다."));
        
        LocalDateTime lastReadTime = participant.getLastReadTime();
        if (lastReadTime == null) {
            lastReadTime = participant.getJoinedAt(); // 참여 시점부터의 메시지 조회
        }
        
        // 마지막으로 읽은 시간 이후의 메시지들 조회
        List<Message> unreadMessages = messageRepository.findByRoomIdAndCreatedAtAfterOrderByCreatedAtAsc(
            roomId, lastReadTime);
        
        // Entity를 DTO로 변환
        return unreadMessages.stream()
            .map(MessageDTO::fromEntity)
            .collect(Collectors.toList());
    }

} 