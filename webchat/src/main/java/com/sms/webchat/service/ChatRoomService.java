package com.sms.webchat.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

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
import com.sms.webchat.entity.User;
import com.sms.webchat.repository.UserRepository;
import com.sms.webchat.enums.RoomType;
import com.sms.webchat.dto.request.ChatRoomCreateRequestDTO;

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
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    @Transactional
    public void quitChatRoom(Long roomId, Long userIdx) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        
        // 참여자 삭제
        RoomParticipant participant = roomParticipantRepository.findByRoomIdAndUserIdx(roomId, userIdx)
            .orElseThrow(() -> new RuntimeException("참여자를 찾을 수 없습니다."));
        
        roomParticipantRepository.delete(participant);
        
        // 남은 참여자 수 확인
        int remainingParticipants = roomParticipantRepository.countByRoomId(roomId);
        if (remainingParticipants <= 1) {
            chatRoom.deactivate();  // ChatRoom 엔티티의 메서드 사용
            chatRoomRepository.save(chatRoom);
        }
    }

    @Transactional
    public Long getOrCreatePrivateRoom(Long userIdx, Long friendIdx) {
        // 두 사용자가 참여한 PRIVATE_CHAT 찾기
        User user = userRepository.findByIdx(userIdx)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        User friend = userRepository.findByIdx(friendIdx)
            .orElseThrow(() -> new RuntimeException("상대방을 찾을 수 없습니다."));
            
        // 기존 1:1 채팅방 찾기
        List<ChatRoom> userRooms = roomParticipantRepository.findByUser(user)
            .stream()
            .map(RoomParticipant::getRoom)
            .filter(room -> room.getRoomType() == RoomType.PRIVATE_CHAT && room.isActive())
            .toList();
            
        for (ChatRoom room : userRooms) {
            boolean isFriendInRoom = roomParticipantRepository.findByRoom(room)
                .stream()
                .anyMatch(participant -> participant.getUser().getIdx().equals(friendIdx));
                
            if (isFriendInRoom) {
                return room.getId();
            }
        }
        
        // 없으면 새로운 채팅방 생성
        ChatRoom newRoom = ChatRoom.builder()
            .roomType(RoomType.PRIVATE_CHAT)
            .maxParticipants(2)
            .isActive(true)
            .build();
        newRoom = chatRoomRepository.save(newRoom);
        
        // 참여자 추가
        RoomParticipant userParticipant = RoomParticipant.builder()
            .room(newRoom)
            .user(user)
            .lastReadTime(LocalDateTime.now())
            .build();
        RoomParticipant friendParticipant = RoomParticipant.builder()
            .room(newRoom)
            .user(friend)
            .lastReadTime(LocalDateTime.now())
            .build();
            
        roomParticipantRepository.save(userParticipant);
        roomParticipantRepository.save(friendParticipant);
        
        return newRoom.getId();
    }

    @Transactional
    public Long createChatRoom(ChatRoomCreateRequestDTO requestDTO) {
        // 1. ChatRoom 생성
        ChatRoom chatRoom = ChatRoom.builder()
            .name(requestDTO.getRoomName())
            .roomType(RoomType.valueOf(requestDTO.getRoomType()))
            .maxParticipants(requestDTO.getMaxParticipants())
            .password(requestDTO.getPassword() != null ? 
                     passwordEncoder.encode(requestDTO.getPassword()) : null)
            .isActive(true)
            .build();
        
        chatRoom = chatRoomRepository.save(chatRoom);
        
        // 2. RoomParticipants 생성
        ChatRoom finalChatRoom = chatRoom;  
        List<RoomParticipant> participants = requestDTO.getParticipants().stream()
            .map(userIdx -> {
                User user = userRepository.findById(userIdx)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
                
                return RoomParticipant.builder()
                    .room(finalChatRoom) 
                    .user(user)
                    .build();
            })
            .collect(Collectors.toList());
        
        roomParticipantRepository.saveAll(participants);
        
        return chatRoom.getId();
    }

} 