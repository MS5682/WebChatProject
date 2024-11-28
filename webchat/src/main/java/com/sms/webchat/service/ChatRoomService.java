package com.sms.webchat.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.sms.webchat.dto.response.ChatRoomListDTO;
import com.sms.webchat.dto.response.PublicGroupChatRoomDTO;
import com.sms.webchat.entity.ChatRoom;
import com.sms.webchat.dto.response.ChatRoomParticipantDTO;
import com.sms.webchat.repository.ChatRoomRepository;
import com.sms.webchat.repository.RoomParticipantRepository;
import com.sms.webchat.entity.RoomParticipant;
import com.sms.webchat.dto.MessageDTO;
import com.sms.webchat.repository.MessageRepository;
import com.sms.webchat.dto.ReadStatusMessage;

import lombok.RequiredArgsConstructor;

import java.util.Date;
import java.util.List;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.Map;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final RoomParticipantRepository roomParticipantRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

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
        
        ReadStatusMessage readStatus = new ReadStatusMessage(userIdx, new Date().toInstant().toString());
        messagingTemplate.convertAndSend(
            "/topic/room/" + roomId + "/read-status", 
            readStatus
        );
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
        List<MessageDTO> unreadMessages = messageRepository.findMessagesWithAttachments(roomId, lastReadTime);
        return unreadMessages;
    }

    @Transactional(readOnly = true)
    public Map<Long, String> getLastReadTimes(Long roomId) {
        List<RoomParticipant> participants = roomParticipantRepository.findAllByRoomId(roomId);
        
        return participants.stream()
            .collect(Collectors.toMap(
                participant -> participant.getUser().getIdx(),
                participant -> participant.getLastReadTime() != null 
                    ? participant.getLastReadTime().toString() 
                    : participant.getJoinedAt().toString()
            ));
    }

} 