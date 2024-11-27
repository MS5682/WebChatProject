package com.sms.webchat.service;

import com.sms.webchat.entity.Message;
import com.sms.webchat.entity.RoomParticipant;
import com.sms.webchat.repository.MessageRepository;
import com.sms.webchat.repository.RoomParticipantRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.sms.webchat.dto.ChatRoomUpdate;
import com.sms.webchat.dto.MessageDTO;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final RoomParticipantRepository participantRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public Message saveMessage(Message message) {
        // 1. 메시지 저장
        Message savedMessage = messageRepository.save(message);
        
        // 2. 채팅방에 메시지 전송 (Entity 대신 DTO 사용)
        MessageDTO messageDTO = MessageDTO.fromEntity(savedMessage);
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoom().getId(), messageDTO);
        
        // 3. 채팅방의 모든 참여자에게 안 읽은 메시지 수와 마지막 메시지 전송
        List<RoomParticipant> participants = participantRepository.findAllByRoomId(message.getRoom().getId());
        for (RoomParticipant participant : participants) {
            // 메시지 발신자는 제외
            if (participant.getUser().getIdx().equals(message.getSender().getIdx())) {
                continue;
            }
            
            int unreadCount = messageRepository.countUnreadMessages(
                message.getRoom().getId(), 
                participant.getUser().getIdx()
            );
            
            messagingTemplate.convertAndSend(
                "/topic/user/" + participant.getUser().getIdx() + "/updates",
                new ChatRoomUpdate("NEW_MESSAGE", 
                    message.getRoom().getId(), 
                    unreadCount,
                    messageDTO)  // 현재 저장된 메시지를 마지막 메시지로 전송
            );
        }
        
        return savedMessage;
    }
} 