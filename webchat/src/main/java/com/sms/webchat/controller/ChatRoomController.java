package com.sms.webchat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.webchat.dto.response.ChatRoomListDTO;
import com.sms.webchat.dto.response.PublicGroupChatRoomDTO;
import com.sms.webchat.dto.response.ChatRoomParticipantDTO;
import com.sms.webchat.service.ChatRoomService;

import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/chat-rooms")
@RequiredArgsConstructor
public class ChatRoomController {
    
    private final ChatRoomService chatRoomService;
    
    @GetMapping("/user/{userIdx}")
    public ResponseEntity<List<ChatRoomListDTO>> getChatRoomList(@PathVariable Long userIdx) {
        // 요청 로그 출력
        System.out.println("사용자 " + userIdx + "의 채팅방 목록 요청");
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
}
