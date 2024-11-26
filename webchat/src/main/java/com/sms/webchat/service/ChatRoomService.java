package com.sms.webchat.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sms.webchat.dto.response.ChatRoomListDTO;
import com.sms.webchat.dto.response.PublicGroupChatRoomDTO;
import com.sms.webchat.entity.ChatRoom;
import com.sms.webchat.dto.response.ChatRoomParticipantDTO;
import com.sms.webchat.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {
    
    private final ChatRoomRepository chatRoomRepository;
    
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

} 