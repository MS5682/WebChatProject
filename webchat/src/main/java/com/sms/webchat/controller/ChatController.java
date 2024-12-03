package com.sms.webchat.controller;

import com.sms.webchat.dto.ChatRoomUpdate;
import com.sms.webchat.dto.MessageDTO;
import com.sms.webchat.entity.ChatRoom;
import com.sms.webchat.entity.Message;
import com.sms.webchat.entity.MessageAttachment;
import com.sms.webchat.entity.RoomParticipant;
import com.sms.webchat.entity.User;
import com.sms.webchat.service.ChatRoomService;
import com.sms.webchat.service.MessageService;
import com.sms.webchat.service.UserService;
import com.sms.webchat.service.MessageAttachmentService;
import com.sms.webchat.mapper.MessageMapper;
import com.sms.webchat.service.FileService;
import com.sms.webchat.dto.response.FileResponseDto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final MessageService messageService;
    private final MessageAttachmentService messageAttachmentService;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageMapper messageMapper;
    private final FileService fileService;
    
    @Value("${file.upload.dir}")
    private String uploadDir;
    
    @MessageMapping("/chat.room/{roomId}/send")
    public void sendMessage(@Payload MessageDTO messageDTO, 
                          @DestinationVariable String roomId) {
        
        User sender = userService.findByName(messageDTO.getSender());
        ChatRoom room = chatRoomService.findById(Long.parseLong(messageDTO.getRoomId()));
        
        Message message = messageMapper.toEntity(messageDTO, sender, room);
        message = messageService.saveMessage(message);
        
        MessageDTO responseDTO;
        if (messageDTO.getFileUrl() != null) {
            MessageAttachment attachment = messageMapper.toMessageAttachment(messageDTO, message);
            attachment = messageAttachmentService.saveMessageAttachment(attachment);
            responseDTO = messageMapper.toDto(attachment);
        } else {
            responseDTO = messageMapper.toDto(message);
        }

        if(messageDTO.getType() == MessageDTO.MessageType.SYSTEM) {
            responseDTO.setType(MessageDTO.MessageType.SYSTEM);
        }
        
        System.out.println("responseDTO: " + responseDTO);

        // 채팅방에 메시지 전송
        messagingTemplate.convertAndSend("/topic/room/" + roomId, responseDTO);
        
        // 참여자들에게 업데이트 전송
        List<RoomParticipant> participants = messageService.getRoomParticipants(room.getId());
        for (RoomParticipant participant : participants) {
            if (participant.getUser().getIdx().equals(sender.getIdx())) {
                continue;
            }
            
            int unreadCount = messageService.getUnreadMessageCount(
                room.getId(), 
                participant.getUser().getIdx()
            );
            
            messagingTemplate.convertAndSend(
                "/topic/user/" + participant.getUser().getIdx() + "/updates",
                new ChatRoomUpdate("NEW_MESSAGE", 
                    room.getId(), 
                    unreadCount,
                    responseDTO)
            );
        }
    }
    
    @PostMapping("/chat/upload")
    @ResponseBody
    public ResponseEntity<FileResponseDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("roomId") String roomId,
            @RequestParam("sender") String sender) {
        try {
            FileResponseDto response = fileService.uploadFile(file, roomId);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
