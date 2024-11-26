package com.sms.webchat.repository;

import java.util.List;

import com.sms.webchat.dto.response.ChatRoomListDTO;
import com.sms.webchat.dto.response.PublicGroupChatRoomDTO;
import com.sms.webchat.dto.response.ChatRoomParticipantDTO;

public interface ChatRoomRepositoryCustom {
    List<ChatRoomListDTO> findChatRoomsByUserIdx(Long userIdx);
    List<PublicGroupChatRoomDTO> findPublicGroupChatRooms();
    List<ChatRoomParticipantDTO> findParticipantsByRoomId(Long roomId);
}