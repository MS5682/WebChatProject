package com.sms.webchat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sms.webchat.dto.response.ChatRoomListDTO;
import com.sms.webchat.dto.response.PublicGroupChatRoomDTO;
import com.sms.webchat.dto.response.ChatRoomParticipantDTO;
import com.sms.webchat.service.ChatRoomService;
import com.sms.webchat.dto.request.ReadTimeRequestDTO;
import com.sms.webchat.dto.response.ApiResponseDto;
import com.sms.webchat.dto.MessageDTO;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/chat-rooms")
@RequiredArgsConstructor
public class ChatRoomController {
    
    private final ChatRoomService chatRoomService;
    
    @GetMapping("/user/{userIdx}")
    public ResponseEntity<List<ChatRoomListDTO>> getChatRoomList(@PathVariable Long userIdx) {
        List<ChatRoomListDTO> chatRooms = chatRoomService.getChatRoomsByUserIdx(userIdx);
        return ResponseEntity.ok(chatRooms);
    }

    @GetMapping("/public")
    public ResponseEntity<List<PublicGroupChatRoomDTO>> getPublicGroupChatRooms() {
        List<PublicGroupChatRoomDTO> publicGroupChatRooms = chatRoomService.getPublicGroupChatRooms();
        return ResponseEntity.ok(publicGroupChatRooms);
    }

    @GetMapping("/participant/{roomId}")
    public ResponseEntity<List<ChatRoomParticipantDTO>> getChatRoomParticipants(@PathVariable Long roomId) {
        
        List<ChatRoomParticipantDTO> participants = chatRoomService.getChatRoomParticipants(roomId);
        return ResponseEntity.ok(participants);
    }

    @PostMapping("/read")
    public ResponseEntity<?> updateLastReadTime(@RequestBody ReadTimeRequestDTO requestDTO) {
        try {
            chatRoomService.updateLastReadTime(requestDTO.getRoomId(), requestDTO.getUserIdx());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @GetMapping("/{roomId}/unread-messages")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(
            @PathVariable Long roomId,
            @RequestParam Long userIdx) {
        try {
            List<MessageDTO> unreadMessages = chatRoomService.getUnreadMessages(roomId, userIdx);
            return ResponseEntity.ok(unreadMessages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
