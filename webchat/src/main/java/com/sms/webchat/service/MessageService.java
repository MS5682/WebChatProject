package com.sms.webchat.service;

import com.sms.webchat.entity.Message;
import com.sms.webchat.entity.RoomParticipant;
import com.sms.webchat.repository.MessageRepository;
import com.sms.webchat.repository.RoomParticipantRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final RoomParticipantRepository participantRepository;
    
    @Transactional
    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
    
    public List<RoomParticipant> getRoomParticipants(Long roomId) {
        return participantRepository.findAllByRoomId(roomId);
    }
    
    public int getUnreadMessageCount(Long roomId, Long userIdx) {
        return messageRepository.countUnreadMessages(roomId, userIdx);
    }
    
} 